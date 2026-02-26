"use client";

import * as React from "react";
import { cn } from "./cn";
import { Search, X } from "lucide-react";

const categories = ["전체", "행사", "모집", "안내", "기타"] as const;

export type FiltersValue = {
  q: string;
  category: (typeof categories)[number];
  source: "전체" | "sojoong" | "aicoss";
};

const SOURCES: { value: FiltersValue["source"]; label: string }[] = [
  { value: "전체", label: "전체" },
  { value: "sojoong", label: "SW중심사업단" },
  { value: "aicoss", label: "AICOSS" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  전체: "📋", 행사: "🎉", 모집: "📣", 안내: "📢", 기타: "📌",
};

export function Filters({
  value,
  onChange,
}: {
  value: FiltersValue;
  onChange: (v: FiltersValue) => void;
}) {
  return (
    <section aria-label="검색 및 필터" className="mt-6 space-y-4">
      {/* 검색 */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
          aria-hidden
        />
        <input
          type="search"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
          placeholder="제목 키워드로 검색…"
          className={cn(
            "w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm",
            "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400",
            "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
            "focus-visible:ring-2 focus-visible:ring-[#008231] focus-visible:outline-none shadow-sm"
          )}
        />
        {value.q && (
          <button
            type="button"
            onClick={() => onChange({ ...value, q: "" })}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange({ ...value, category: c })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
              value.category === c
                ? "bg-[#008231] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            )}
          >
            <span aria-hidden>{CATEGORY_EMOJI[c]}</span>
            {c}
          </button>
        ))}

        {/* 구분선 */}
        <span className="mx-1 h-6 w-px self-center bg-zinc-200 dark:bg-zinc-700" aria-hidden />

        {/* 소스 탭 */}
        {SOURCES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...value, source: s.value })}
            className={cn(
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
              value.source === s.value
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            )}
          >
            {s.label}
          </button>
        ))}

        {/* 필터 초기화 */}
        {(value.q || value.category !== "전체" || value.source !== "전체") && (
          <button
            type="button"
            onClick={() => onChange({ q: "", category: "전체", source: "전체" })}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden />
            초기화
          </button>
        )}
      </div>
    </section>
  );
}
