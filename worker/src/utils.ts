// 验证码提取工具

// 常见验证码模式
const CODE_PATTERNS = [
  // 6位数字验证码
  /(?:验证码|code|码|Code|CODE)[^\d]*(\d{6})\b/i,
  /\b(\d{6})\s*(?:是你的|is your|为您的)/i,
  // 4位数字验证码
  /(?:验证码|code|码|Code|CODE)[^\d]*(\d{4})\b/i,
  /\b(\d{4})\s*(?:是你的|is your|为您的)/i,
  // 通用：独立的4-8位数字
  /\b(\d{4,8})\b/,
  // 字母数字混合验证码
  /(?:验证码|code|码|Code|CODE)[^\w]*([A-Za-z0-9]{4,8})\b/i,
];

export function extractVerificationCode(text: string): string | null {
  if (!text) return null;

  // 清理文本
  const cleanText = text.replace(/\s+/g, ' ').trim();

  for (const pattern of CODE_PATTERNS) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// 从邮件主题和正文中提取验证码
export function extractCodeFromEmail(subject: string, body: string): string | null {
  // 优先从主题提取
  const subjectCode = extractVerificationCode(subject);
  if (subjectCode) return subjectCode;

  // 从正文提取
  return extractVerificationCode(body);
}
