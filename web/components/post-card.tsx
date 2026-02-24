import Link from "next/link";
import type { Post } from "../lib/types";
import { cn } from "./cn";

function badgeClass(category: string) {
  switch (category) {
    case "행사": return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/40";
    case "모집": return "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800/40";
    case "안내": return "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/40";
    default: return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/40";
  }
}

function sourceLabel(source: Post["source"]) {
  return source === "sojoong" ? "SW중심사업단" : "AICOSS";
}

function formatDate(s: string | null) {
  if (!s) return "날짜 미상";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "날짜 미상";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex flex-col rounded-xl border border-black/8 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeClass(post.category))}>
          {post.category}
        </span>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
          {sourceLabel(post.source)}
        </span>
      </div>

      <h3 className="mt-3 flex-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">
        <Link
          href={`/posts/${encodeURIComponent(post.id)}`}
          className="rounded focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none group-hover:text-brand transition-colors"
        >
          {post.title}
        </Link>
      </h3>

      {post.excerpt ? (
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <time
          dateTime={post.posted_at ?? undefined}
          className="text-xs text-zinc-400 dark:text-zinc-500"
        >
          {formatDate(post.posted_at)}
        </time>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-brand hover:underline rounded focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
          aria-label={`"${post.title}" 원문 보기 (새 탭)`}
        >
          원문 보기 ↗
        </a>
      </div>
    </article>
  );
}

/** 로딩 스켈레톤 */
export function PostCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-xl border border-black/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-2">
        <div className="h-5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="ml-auto h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-3 w-full rounded bg-zinc-50 dark:bg-zinc-800/50" />
        <div className="h-3 w-3/4 rounded bg-zinc-50 dark:bg-zinc-800/50" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
