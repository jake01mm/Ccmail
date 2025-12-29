// Email 处理器 - 处理收到的邮件
import PostalMime from 'postal-mime';
import { Env, EmailMessage } from './types';
import { Database } from './db';
import { extractCodeFromEmail } from './utils';

export async function handleEmail(message: EmailMessage, env: Env): Promise<void> {
  const db = new Database(env);

  // 获取完整收件人地址（支持多域名）
  const toAddress = message.to.toLowerCase();
  const alias = toAddress.split('@')[0].toLowerCase();
  const domain = toAddress.split('@')[1]?.toLowerCase();

  console.log(`Received email for: ${toAddress} (alias: ${alias}, domain: ${domain})`);

  // 检查别名是否存在且激活（使用完整地址查找，支持多域名）
  const aliasId = await db.getAliasId(toAddress);

  if (!aliasId) {
    console.log(`Alias not found or inactive: ${alias}`);
    message.setReject(`Mailbox ${alias} does not exist`);
    return;
  }

  try {
    // 解析邮件内容
    const rawEmail = await streamToArrayBuffer(message.raw);
    const parser = new PostalMime();
    const parsed = await parser.parse(rawEmail);

    // 构建 headers 字符串
    const headersStr = Array.from(message.headers.entries())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    // 提取验证码
    const textContent = parsed.text || '';
    const htmlContent = parsed.html || '';
    const subject = parsed.subject || '';

    // 从纯文本提取，如果没有则从HTML提取
    const verificationCode = extractCodeFromEmail(subject, textContent || stripHtml(htmlContent));

    // 保存到数据库
    const emailId = await db.saveEmail({
      aliasId,
      from: message.from,
      to: toAddress,
      subject,
      bodyText: textContent,
      bodyHtml: htmlContent,
      verificationCode,
      rawHeaders: headersStr,
    });

    console.log(`Email saved with ID: ${emailId}, verification code: ${verificationCode}`);
  } catch (error) {
    console.error('Error processing email:', error);
    // 不拒绝邮件，允许重试
    throw error;
  }
}

// 将 ReadableStream 转换为 ArrayBuffer
async function streamToArrayBuffer(stream: ReadableStream): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}

// 简单的 HTML 标签移除
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
