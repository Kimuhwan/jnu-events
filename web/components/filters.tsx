"use client";

import * as React from "react";
import { cn } from "./cn";
import { Search } from "lucide-react";

const categories = ["전체", "행사", "모집", "안내", "기타"] as const;
const sources = ["전체", "sojoong", "aicoss"] as const;

export type FiltersValue = {
  q: string;
  category: (typeof categories)[number];
  source: (typeof sources)[number];
};

export function Filters({ value, onChange }: { value: FiltersValue; onChange: (v: FiltersValue) => void }) {
  return (
    <section aria-label="검색 및 필터" className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">검색</span>
          <div className="mt-2 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" aria-hidden />
            <input
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              placeholder="제목 키워드로 검색"
              className={cn(
                "w-full rounded-md border pl-9 pr-3 py-2 text-sm",
                "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-500",
                "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
                "focus-visible:ring-2 focus-visible:ring-brand"
              )}
            />
          </div>
        </label>

        <div className="flex gap-3">
          <label className="w-40">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">분류</span>
            <select
              value={value.category}
              onChange={(e) => onChange({ ...value, category: e.target.value as any })}
              className={cn(
                "mt-2 w-full rounded-md border px-3 py-2 text-sm",
                "border-black/10 bg-white text-zinc-900",
                "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
                "focus-visible:ring-2 focus-visible:ring-brand"
              )}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="w-40">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">소스</span>
            <select
              value={value.source}
              onChange={(e) => onChange({ ...value, source: e.target.value as any })}
              className={cn(
                "mt-2 w-full rounded-md border px-3 py-2 text-sm",
                "border-black/10 bg-white text-zinc-900",
                "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
                "focus-visible:ring-2 focus-visible:ring-brand"
              )}
            >
              <option value="전체">전체</option>
              <option value="sojoong">SW중심</option>
              <option value="aicoss">AICOSS</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
