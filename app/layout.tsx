// 添加全局样式
import '@/app/ui/global.css';

import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'wang qiang',
  description: 'The official Next.js Learn Course',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      {/* inter.className 这个是字体，Tailwind 的 antialiased 类，该类可使字体更加平滑 */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
