// 数据库适配器 - 自动选择 D1 或 PostgreSQL
import { Env } from './types';
import { Database } from './db';
import { DatabaseD1 } from './db-d1';

// 统一的数据库接口
export type DatabaseAdapter = Database | DatabaseD1;

/**
 * 创建数据库实例
 * 优先使用 D1，如果没有配置则使用 PostgreSQL
 */
export function createDatabase(env: Env): DatabaseAdapter {
  if (env.DB) {
    console.log('Using Cloudflare D1 database');
    return new DatabaseD1(env);
  } else if (env.DATABASE_URL) {
    console.log('Using PostgreSQL/Neon database');
    return new Database(env);
  } else {
    throw new Error('No database configured. Please set up either D1 (DB) or PostgreSQL (DATABASE_URL)');
  }
}
