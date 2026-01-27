// 类型定义

export interface Env {
  DATABASE_URL?: string;  // PostgreSQL/Neon (可选)
  DB?: D1Database;        // Cloudflare D1 (可选)
  DOMAIN: string;
}

export interface EmailMessage {
  readonly from: string;
  readonly to: string;
  readonly headers: Headers;
  readonly raw: ReadableStream;
  readonly rawSize: number;
  setReject(reason: string): void;
  forward(rcptTo: string, headers?: Headers): Promise<void>;
}

export interface ParsedEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  headers: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
