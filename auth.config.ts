import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // 授权回调，检查用户是否登录，如果登录，则返回 true，否则返回 false。
    authorized({ auth, request: { nextUrl } }) {
      
      console.log('auth', auth);
      console.log('nextUrl', nextUrl);
      // 是否已经登录
      const isLoggedIn = !!auth?.user;

      // 接下来访问的页面是否是仪表板页面
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        // 如果是仪表板页面，则检查用户是否登录，如果登录，则返回 true，否则返回 false。
        if (isLoggedIn) return true;
        // 如果用户未登录，则重定向到登录页面
        return false; 
      }
      
      // 到这里表示访问的不是仪表板页面，如果已经登录，则重定向到仪表板页面
      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      // 如果访问的是其他页面则允许访问
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;