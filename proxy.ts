import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  // 定义哪些路由需要经过认证中间件 :匹配所有路径，除了 API、静态文件、图片和 PNG 文件
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};