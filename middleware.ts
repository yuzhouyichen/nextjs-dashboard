import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// 中间件调用 auth() → 检查 authorized 回调
export default NextAuth(authConfig).auth;
 
export const config = {
  // 定义哪些路由需要经过认证中间件 :匹配所有路径，除了 API、静态文件、图片和 PNG 文件
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};