import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sino Trade Article View Manager | 文章瀏覽管理器",
  description: "Sino Trade文章瀏覽次數管理工具 - 選擇文章並自動增加瀏覽次數，支援深談總經、產業大勢、川普專題等頻道",
  keywords: ["Sino Trade", "文章管理", "瀏覽次數", "文章工具"],
  authors: [{ name: "Sino Trade" }],
  openGraph: {
    title: "Sino Trade Article View Manager",
    description: "文章瀏覽次數管理工具",
    type: "website",
    locale: "zh_TW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
