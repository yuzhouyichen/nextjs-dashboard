import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { getDB } from '@/app/lib/db';

// 获取用户
async function getUser(email: string): Promise<User | undefined> {
  try {
    const db = getDB();
    const users = await db.sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
    return users[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 解析认证凭证
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        // 如果解析成功，获取用户
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // 数据库获取用户
          const user = await getUser(email);
          // 如果用户不存在，返回 null
          if (!user) return null;
          // 比较密码，密码是明文，数据库中是哈希值，
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
 
        return null;
      },
    }),
  ],
});