"use client";
import type { Post } from "../lib/types";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  행사: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  모집: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  안내: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  기타: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-400" },
};

const SOURCE_LABEL: Record<string, string> = {
  sojoong: "SW중심사업단",
  aicoss: "AICOSS",
};

function formatDate(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}월 ${day}일`;
}

export function PostCard({ post }: { post: Post }) {
  const cat = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES["기타"];
  const dateStr = formatDate(post.posted_at);
  const src = SOURCE_LABEL[post.source] ?? post.source;

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008231]"
      aria-label={`${post.title} — 원문 보기`}
    >
      {/* 상단: 카테고리 뱃지 + 소스 */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cat.bg} ${cat.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} aria-hidden />
          {post.category}
        </span>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-full px-2 py-0.5">
          {src}
        </span>
      </div>

      {/* 제목 */}
      <p className="flex-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-3 group-hover:text-[#008231] transition-colors duration-150">
        {post.title}
      </p>

      {/* 하단: 날짜 + 원문 아이콘 */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-zinc-100 dark:border-white/5">
        {dateStr ? (
          <time dateTime={post.posted_at ?? undefined} className="text-xs text-zinc-400 dark:text-zinc-500">
            {dateStr}
          </time>
        ) : (
          <span className="text-xs text-zinc-300 dark:text-zinc-600">날짜 미상</span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#008231] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          원문 보기
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </span>
      </div>
    </a>
  );
}

/** 로딩 스켈레톤 */
export function PostCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between">
        <div className="h-5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="flex justify-between pt-1 border-t border-zinc-100 dark:border-white/5">
        <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
