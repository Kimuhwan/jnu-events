import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export const metadata: Metadata = {
  title: {
    default: "전남대학교 공지/행사 모아보기",
    template: "%s | 전남대 공지 모아보기",
  },
  description:
    "전남대학교 SW중심사업단 · AICOSS(인공지능혁신융합사업단) 공지사항과 행사 정보를 한 곳에서 검색하고 확인하세요.",
  keywords: ["전남대학교", "공지", "행사", "SW중심사업단", "AICOSS", "인공지능", "소프트웨어"],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "전남대학교 공지/행사 모아보기",
    description: "SW중심사업단 · AICOSS 공지사항을 한 곳에서 확인하세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        <ThemeProvider>
          <Header />
          <main id="content" className="mx-auto max-w-5xl px-4">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
