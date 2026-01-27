// API 路由处理
import { Env, ApiResponse } from './types';
import { createDatabase } from './db-adapter';
import { HTML_PAGE } from './html';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// JSON 响应
function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// 错误响应
function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// 成功响应
function successResponse<T>(data: T): Response {
  return jsonResponse({ success: true, data });
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const db = createDatabase(env);

  try {
    // 路由匹配
    // GET /api/aliases - 获取所有别名
    if (method === 'GET' && path === '/api/aliases') {
      const aliases = await db.getAllAliases();
      return successResponse(aliases);
    }

    // POST /api/aliases - 创建新别名（支持多域名）
    if (method === 'POST' && path === '/api/aliases') {
      const body = await request.json() as { alias: string; domain?: string; description?: string };

      if (!body.alias) {
        return errorResponse('Alias is required');
      }

      // 验证别名格式
      const aliasRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
      if (!aliasRegex.test(body.alias)) {
        return errorResponse('Invalid alias format. Use letters, numbers, dots, underscores, or hyphens.');
      }

      // 使用提供的域名，或回退到环境变量中的默认域名
      const domain = (body.domain || env.DOMAIN).toLowerCase();

      // 验证域名格式
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return errorResponse('Invalid domain format');
      }

      // 检查域名是否存在且激活
      const isDomainActive = await db.isDomainActive(domain);
      if (!isDomainActive) {
        // 如果域名不存在，自动添加
        await db.addDomain(domain);
      }

      try {
        const result = await db.createAlias(body.alias.toLowerCase(), domain, body.description);
        return successResponse(result);
      } catch (e: unknown) {
        const error = e as Error;
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          return errorResponse('Alias already exists for this domain', 409);
        }
        throw e;
      }
    }

    // GET /api/aliases/:id/emails - 获取别名的邮件列表
    const aliasEmailsMatch = path.match(/^\/api\/aliases\/(\d+)\/emails$/);
    if (method === 'GET' && aliasEmailsMatch) {
      const aliasId = parseInt(aliasEmailsMatch[1]);
      const emails = await db.getEmailsByAlias(aliasId);
      return successResponse(emails);
    }

    // GET /api/aliases/:id/latest-code - 获取最新验证码
    const latestCodeMatch = path.match(/^\/api\/aliases\/(\d+)\/latest-code$/);
    if (method === 'GET' && latestCodeMatch) {
      const aliasId = parseInt(latestCodeMatch[1]);
      const code = await db.getLatestCode(aliasId);
      return successResponse({ code });
    }

    // PUT /api/aliases/:id/toggle - 切换别名状态
    const toggleMatch = path.match(/^\/api\/aliases\/(\d+)\/toggle$/);
    if (method === 'PUT' && toggleMatch) {
      const aliasId = parseInt(toggleMatch[1]);
      const body = await request.json() as { is_active: boolean };
      await db.toggleAlias(aliasId, body.is_active);
      return successResponse({ updated: true });
    }

    // DELETE /api/aliases/:id - 删除别名
    const deleteMatch = path.match(/^\/api\/aliases\/(\d+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const aliasId = parseInt(deleteMatch[1]);
      await db.deleteAlias(aliasId);
      return successResponse({ deleted: true });
    }

    // GET /api/emails/:id - 获取邮件详情
    const emailDetailMatch = path.match(/^\/api\/emails\/(\d+)$/);
    if (method === 'GET' && emailDetailMatch) {
      const emailId = parseInt(emailDetailMatch[1]);
      const email = await db.getEmailById(emailId);
      if (!email) {
        return errorResponse('Email not found', 404);
      }
      return successResponse(email);
    }

    // ========== 域名管理 API ==========

    // GET /api/domains - 获取所有域名
    if (method === 'GET' && path === '/api/domains') {
      const domains = await db.getAllDomains();
      return successResponse(domains);
    }

    // POST /api/domains - 添加新域名
    if (method === 'POST' && path === '/api/domains') {
      const body = await request.json() as { domain: string };

      if (!body.domain) {
        return errorResponse('Domain is required');
      }

      // 验证域名格式
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(body.domain)) {
        return errorResponse('Invalid domain format');
      }

      try {
        const result = await db.addDomain(body.domain);
        return successResponse(result);
      } catch (e: unknown) {
        const error = e as Error;
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          return errorResponse('Domain already exists', 409);
        }
        throw e;
      }
    }

    // DELETE /api/domains/:id - 删除域名
    const deleteDomainMatch = path.match(/^\/api\/domains\/(\d+)$/);
    if (method === 'DELETE' && deleteDomainMatch) {
      const domainId = parseInt(deleteDomainMatch[1]);
      await db.deleteDomain(domainId);
      return successResponse({ deleted: true });
    }

    // 健康检查
    if (path === '/api/health') {
      return successResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // 首页 - 返回 HTML
    if (path === '/' || path === '/index.html') {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse('Internal server error', 500);
  }
}
