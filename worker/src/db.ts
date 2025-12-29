// 数据库连接和操作
import { Env } from './types';
import { neon } from '@neondatabase/serverless';

export class Database {
  private sql: ReturnType<typeof neon>;

  constructor(env: Env) {
    this.sql = neon(env.DATABASE_URL, { fullResults: true });
  }

  private async query<T>(sqlQuery: string, params: unknown[] = []): Promise<T[]> {
    // 使用 query 方法执行带参数的 SQL
    const result = await this.sql.query(sqlQuery, params);
    return (result as { rows: T[] }).rows;
  }

  // 检查别名是否存在且激活
  async isAliasActive(alias: string): Promise<boolean> {
    const result = await this.query<{ is_active: boolean }>(
      'SELECT is_active FROM email_aliases WHERE alias = $1',
      [alias]
    );
    return result.length > 0 && result[0].is_active;
  }

  // 获取别名 ID
  async getAliasId(alias: string): Promise<number | null> {
    const result = await this.query<{ id: number }>(
      'SELECT id FROM email_aliases WHERE alias = $1 AND is_active = TRUE',
      [alias]
    );
    return result.length > 0 ? result[0].id : null;
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
    const result = await this.query<{ id: number }>(
      `INSERT INTO emails (alias_id, from_address, to_address, subject, body_text, body_html, verification_code, raw_headers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [data.aliasId, data.from, data.to, data.subject, data.bodyText, data.bodyHtml, data.verificationCode, data.rawHeaders]
    );
    return result[0].id;
  }

  // 创建别名
  async createAlias(alias: string, domain: string, description?: string): Promise<{ id: number; fullAddress: string }> {
    const fullAddress = `${alias}@${domain}`;
    const result = await this.query<{ id: number }>(
      `INSERT INTO email_aliases (alias, full_address, description)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [alias, fullAddress, description || null]
    );
    return { id: result[0].id, fullAddress };
  }

  // 获取所有别名
  async getAllAliases(): Promise<Array<{
    id: number;
    alias: string;
    full_address: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    email_count: number;
  }>> {
    return await this.query(
      `SELECT ea.*,
              (SELECT COUNT(*) FROM emails e WHERE e.alias_id = ea.id) as email_count
       FROM email_aliases ea
       ORDER BY ea.created_at DESC`
    );
  }

  // 获取别名的邮件列表
  async getEmailsByAlias(aliasId: number, limit = 50): Promise<Array<{
    id: number;
    from_address: string;
    subject: string;
    verification_code: string | null;
    received_at: string;
  }>> {
    return await this.query(
      `SELECT id, from_address, subject, verification_code, received_at
       FROM emails
       WHERE alias_id = $1
       ORDER BY received_at DESC
       LIMIT $2`,
      [aliasId, limit]
    );
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
    const result = await this.query<{
      id: number;
      from_address: string;
      to_address: string;
      subject: string;
      body_text: string;
      body_html: string;
      verification_code: string | null;
      received_at: string;
    }>(
      `SELECT id, from_address, to_address, subject, body_text, body_html, verification_code, received_at
       FROM emails
       WHERE id = $1`,
      [id]
    );
    return result.length > 0 ? result[0] : null;
  }

  // 切换别名状态
  async toggleAlias(id: number, isActive: boolean): Promise<void> {
    await this.query(
      'UPDATE email_aliases SET is_active = $1 WHERE id = $2',
      [isActive, id]
    );
  }

  // 删除别名（及其所有邮件）
  async deleteAlias(id: number): Promise<void> {
    await this.query('DELETE FROM email_aliases WHERE id = $1', [id]);
  }

  // 获取最新验证码
  async getLatestCode(aliasId: number): Promise<string | null> {
    const result = await this.query<{ verification_code: string }>(
      `SELECT verification_code FROM emails
       WHERE alias_id = $1 AND verification_code IS NOT NULL
       ORDER BY received_at DESC
       LIMIT 1`,
      [aliasId]
    );
    return result.length > 0 ? result[0].verification_code : null;
  }
}
