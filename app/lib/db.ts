/**
 * 数据库连接辅助函数
 * 在 Cloudflare Workers 环境中使用 D1
 */

import { getD1Client, type D1Database } from './d1-adapter';

// 全局变量用于存储 D1 数据库实例
// 在 OpenNext + Cloudflare Workers 中，env 会通过某种方式注入
declare global {
  // eslint-disable-next-line no-var
  var __D1_DB__: D1Database | undefined;
  // eslint-disable-next-line no-var
  var __ENV__: { DB?: D1Database } | undefined;
}

/**
 * 获取 D1 数据库客户端
 * 在 Cloudflare Workers 环境中，通过 env.DB 获取
 */
export function getDB(): ReturnType<typeof getD1Client> {
  // 优先从全局 env 获取（OpenNext 可能会注入）
  if (typeof globalThis !== 'undefined' && (globalThis as any).__ENV__?.DB) {
    return getD1Client((globalThis as any).__ENV__.DB);
  }

  // 从全局变量获取（用于开发环境）
  if (typeof globalThis !== 'undefined' && (globalThis as any).__D1_DB__) {
    return getD1Client((globalThis as any).__D1_DB__);
  }

  // 尝试从 process.env 获取（如果 OpenNext 将其注入）
  if (typeof process !== 'undefined' && (process.env as any).DB) {
    return getD1Client((process.env as any).DB);
  }

  throw new Error(
    'D1 database not available. ' +
    'Make sure DB is passed through env in Cloudflare Workers context. ' +
    'For local development, use: npx wrangler dev'
  );
}

/**
 * 设置 D1 数据库实例（用于开发或测试）
 */
export function setDB(db: D1Database) {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__D1_DB__ = db;
  }
}

/**
 * 设置环境对象（OpenNext 可能会调用）
 */
export function setEnv(env: { DB?: D1Database }) {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__ENV__ = env;
  }
}
