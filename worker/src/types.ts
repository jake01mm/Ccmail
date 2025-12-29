// 类型定义

export interface Env {
  DATABASE_URL: string;
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
