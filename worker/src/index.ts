// 主入口文件
import { Env, EmailMessage } from './types';
import { handleEmail } from './email';
import { handleRequest } from './api';

export default {
  // HTTP 请求处理 (API)
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },

  // Email 接收处理
  async email(message: EmailMessage, env: Env): Promise<void> {
    await handleEmail(message, env);
  },
};
