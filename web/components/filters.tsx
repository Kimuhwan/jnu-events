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
  { value: "전체", label: "전체 소스" },
  { value: "sojoong", label: "SW중심사업단" },
  { value: "aicoss", label: "AICOSS" },
];

const selectClass = cn(
  "mt-2 w-full rounded-md border px-3 py-2 text-sm appearance-none",
  "border-black/10 bg-white text-zinc-900",
  "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
  "cursor-pointer"
);

export function Filters({
  value,
  onChange,
}: {
  value: FiltersValue;
  onChange: (v: FiltersValue) => void;
}) {
  const hasFilter = value.q || value.category !== "전체" || value.source !== "전체";

  return (
    <section aria-label="검색 및 필터" className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* 검색 입력 */}
        <label className="flex-1 min-w-0">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">검색</span>
          <div className="mt-2 relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              placeholder="제목 키워드로 검색"
              className={cn(
                "w-full rounded-md border pl-9 pr-9 py-2 text-sm",
                "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-400",
                "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
                "focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
              )}
            />
            {value.q && (
              <button
                type="button"
                onClick={() => onChange({ ...value, q: "" })}
                aria-label="검색어 지우기"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        </label>

        {/* 분류 선택 */}
        <label className="w-36">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">분류</span>
          <select
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value as any })}
            className={selectClass}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {/* 소스 선택 */}
        <label className="w-40">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">사업단</span>
          <select
            value={value.source}
            onChange={(e) => onChange({ ...value, source: e.target.value as any })}
            className={selectClass}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 활성 필터 뱃지 */}
      {hasFilter && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">적용된 필터:</span>
          {value.q && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:bg-brand/20">
              "{value.q}"
              <button
                type="button"
                onClick={() => onChange({ ...value, q: "" })}
                aria-label="검색어 필터 제거"
                className="ml-0.5 rounded-full hover:opacity-70"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          )}
          {value.category !== "전체" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:bg-brand/20">
              {value.category}
              <button
                type="button"
                onClick={() => onChange({ ...value, category: "전체" })}
                aria-label="분류 필터 제거"
                className="ml-0.5 rounded-full hover:opacity-70"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          )}
          {value.source !== "전체" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:bg-brand/20">
              {SOURCES.find((s) => s.value === value.source)?.label}
              <button
                type="button"
                onClick={() => onChange({ ...value, source: "전체" })}
                aria-label="사업단 필터 제거"
                className="ml-0.5 rounded-full hover:opacity-70"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
}
