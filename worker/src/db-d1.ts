// D1 数据库连接和操作
import { Env } from './types';

export class DatabaseD1 {
  private db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  // 检查别名是否存在且激活
  async isAliasActive(alias: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT is_active FROM email_aliases WHERE alias = ?')
      .bind(alias)
      .first<{ is_active: number }>();
    return result !== null && result.is_active === 1;
  }

  // 获取别名 ID（根据完整地址查找，支持多域名）
  async getAliasId(fullAddress: string): Promise<number | null> {
    const result = await this.db
      .prepare('SELECT id FROM email_aliases WHERE full_address = ? AND is_active = 1')
      .bind(fullAddress.toLowerCase())
      .first<{ id: number }>();
    return result ? result.id : null;
  }

  // 保存邮件
  async saveEmail(data: {
    aliasId: number;
    from: string;
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml: string;
    verificationCode: string | null;
    rawHeaders: string;
  }): Promise<number> {
    const result = await this.db
      .prepare(
        `INSERT INTO emails (alias_id, from_address, to_address, subject, body_text, body_html, verification_code, raw_headers)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.aliasId,
        data.from,
        data.to,
        data.subject,
        data.bodyText,
        data.bodyHtml,
        data.verificationCode,
        data.rawHeaders
      )
      .run();
    
    return result.meta.last_row_id as number;
  }

  // 创建别名（支持多域名）
  async createAlias(alias: string, domain: string, description?: string): Promise<{ id: number; fullAddress: string }> {
    const fullAddress = `${alias}@${domain}`;
    const result = await this.db
      .prepare(
        `INSERT INTO email_aliases (alias, full_address, domain, description)
         VALUES (?, ?, ?, ?)`
      )
      .bind(alias.toLowerCase(), fullAddress.toLowerCase(), domain.toLowerCase(), description || null)
      .run();
    
    return { 
      id: result.meta.last_row_id as number, 
      fullAddress: fullAddress.toLowerCase() 
    };
  }

  // 获取所有别名（包含域名信息）
  async getAllAliases(): Promise<Array<{
    id: number;
    alias: string;
    full_address: string;
    domain: string | null;
    description: string | null;
    is_active: number;
    created_at: string;
    email_count: number;
  }>> {
    const result = await this.db
      .prepare(
        `SELECT ea.*,
                (SELECT COUNT(*) FROM emails e WHERE e.alias_id = ea.id) as email_count
         FROM email_aliases ea
         ORDER BY ea.created_at DESC`
      )
      .all();
    
    return result.results as Array<{
      id: number;
      alias: string;
      full_address: string;
      domain: string | null;
      description: string | null;
      is_active: number;
      created_at: string;
      email_count: number;
    }>;
  }

  // 获取别名的邮件列表
  async getEmailsByAlias(aliasId: number, limit = 50): Promise<Array<{
    id: number;
    from_address: string;
    subject: string;
    verification_code: string | null;
    received_at: string;
  }>> {
    const result = await this.db
      .prepare(
        `SELECT id, from_address, subject, verification_code, received_at
         FROM emails
         WHERE alias_id = ?
         ORDER BY received_at DESC
         LIMIT ?`
      )
      .bind(aliasId, limit)
      .all();
    
    return result.results as Array<{
      id: number;
      from_address: string;
      subject: string;
      verification_code: string | null;
      received_at: string;
    }>;
  }

  // 获取单封邮件详情
  async getEmailById(id: number): Promise<{
    id: number;
    from_address: string;
    to_address: string;
    subject: string;
    body_text: string;
    body_html: string;
    verification_code: string | null;
    received_at: string;
  } | null> {
    const result = await this.db
      .prepare(
        `SELECT id, from_address, to_address, subject, body_text, body_html, verification_code, received_at
         FROM emails
         WHERE id = ?`
      )
      .bind(id)
      .first<{
        id: number;
        from_address: string;
        to_address: string;
        subject: string;
        body_text: string;
        body_html: string;
        verification_code: string | null;
        received_at: string;
      }>();
    
    return result || null;
  }

  // 切换别名状态
  async toggleAlias(id: number, isActive: boolean): Promise<void> {
    await this.db
      .prepare('UPDATE email_aliases SET is_active = ? WHERE id = ?')
      .bind(isActive ? 1 : 0, id)
      .run();
  }

  // 删除别名（及其所有邮件）
  async deleteAlias(id: number): Promise<void> {
    await this.db
      .prepare('DELETE FROM email_aliases WHERE id = ?')
      .bind(id)
      .run();
  }

  // 获取最新验证码
  async getLatestCode(aliasId: number): Promise<string | null> {
    const result = await this.db
      .prepare(
        `SELECT verification_code FROM emails
         WHERE alias_id = ? AND verification_code IS NOT NULL
         ORDER BY received_at DESC
         LIMIT 1`
      )
      .bind(aliasId)
      .first<{ verification_code: string }>();
    
    return result ? result.verification_code : null;
  }

  // ========== 域名管理方法 ==========

  // 获取所有域名
  async getAllDomains(): Promise<Array<{
    id: number;
    domain: string;
    is_active: number;
    created_at: string;
    alias_count: number;
  }>> {
    const result = await this.db
      .prepare(
        `SELECT d.*,
                (SELECT COUNT(*) FROM email_aliases ea WHERE ea.domain = d.domain) as alias_count
         FROM domains d
         ORDER BY d.created_at DESC`
      )
      .all();
    
    return result.results as Array<{
      id: number;
      domain: string;
      is_active: number;
      created_at: string;
      alias_count: number;
    }>;
  }

  // 添加域名
  async addDomain(domain: string): Promise<{ id: number; domain: string }> {
    const result = await this.db
      .prepare(
        `INSERT INTO domains (domain, is_active)
         VALUES (?, 1)
         ON CONFLICT(domain) DO UPDATE SET is_active = 1`
      )
      .bind(domain.toLowerCase())
      .run();
    
    // 获取插入或更新的记录
    const inserted = await this.db
      .prepare('SELECT id, domain FROM domains WHERE domain = ?')
      .bind(domain.toLowerCase())
      .first<{ id: number; domain: string }>();
    
    return inserted!;
  }

  // 删除域名（软删除，设置为非激活）
  async deleteDomain(domainId: number): Promise<void> {
    await this.db
      .prepare('UPDATE domains SET is_active = 0 WHERE id = ?')
      .bind(domainId)
      .run();
  }

  // 检查域名是否存在且激活
  async isDomainActive(domain: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT is_active FROM domains WHERE domain = ?')
      .bind(domain.toLowerCase())
      .first<{ is_active: number }>();
    
    return result !== null && result.is_active === 1;
  }
}
