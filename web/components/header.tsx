"use client";

import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "./cn";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme === "dark") || (theme === "system" && resolvedTheme === "dark");

  return (
    <header className="border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-zinc-950/70 backdrop-blur">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white dark:focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-sm focus:shadow">
        본문으로 건너뛰기
      </a>

      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-brand rounded-md">
          <Image
            src="/brand/jnu-logo.svg"
            alt="전남대학교"
            width={110}
            height={28}
            priority
            className="h-7 w-auto"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              전남대학교 행사/공지 모아보기
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              SW중심사업단 · AICOSS (MVP)
            </div>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              "border-black/10 bg-white hover:bg-zinc-50 text-zinc-900",
              "dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100",
              "focus-visible:ring-2 focus-visible:ring-brand"
            )}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </button>

          <a
            href="https://github.com/"
            className={cn(
              "hidden sm:inline-flex rounded-md border px-3 py-2 text-sm",
              "border-black/10 bg-white hover:bg-zinc-50 text-zinc-900",
              "dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100",
              "focus-visible:ring-2 focus-visible:ring-brand"
            )}
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
