import Link from "next/link";
import type { Post } from "../lib/types";
import { cn } from "./cn";

function badgeClass(category: string) {
  switch (category) {
    case "행사": return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "모집": return "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200";
    case "안내": return "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
    default: return "bg-zinc-50 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";
  }
}

function sourceLabel(source: Post["source"]) {
  return source === "sojoong" ? "SW중심사업단" : "AICOSS";
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-xl border border-black/10 bg-white p-4 shadow-sm hover:shadow transition dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-start gap-3">
        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeClass(post.category))}>
          {post.category}
        </span>
        <div className="ml-auto text-xs text-zinc-600 dark:text-zinc-400">
          {sourceLabel(post.source)} · {post.posted_at ? new Date(post.posted_at).toLocaleDateString("ko-KR") : "날짜 미상"}
        </div>
      </div>

      <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <Link
          href={`/posts/${encodeURIComponent(post.id)}`}
          className="rounded-md focus-visible:ring-2 focus-visible:ring-brand"
        >
          {post.title}
        </Link>
      </h3>

      {post.excerpt ? (
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
          {post.excerpt}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-3 text-sm">
        <a
          href={post.url}
          target="_blank"
          rel="noreferrer"
          className="text-brand hover:underline rounded-md focus-visible:ring-2 focus-visible:ring-brand"
        >
          원문 보기
        </a>
      </div>
    </article>
  );
}
