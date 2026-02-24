"use client";

import * as React from "react";
import { fetchPost } from "../../../lib/api";
import type { Post } from "../../../lib/types";
import Link from "next/link";
import { PostCardSkeleton } from "../../../components/post-card";

type Category = Post["category"];

function badgeClass(category: Category) {
  switch (category) {
    case "행사": return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/40";
    case "모집": return "bg-sky-50 text-sky-700 ring-1 ring-sky-200/60 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800/40";
    case "안내": return "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/40";
    default: return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700/40";
  }
}

function formatDateTime(s: string | null) {
  if (!s) return "날짜 미상";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "날짜 미상";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function PostDetail({ id }: { id: string }) {
  const [post, setPost] = React.useState<Post | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await fetchPost(id);
        setPost(p);
      } catch (e: any) {
        setError(e?.message ?? "불러오기에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 space-y-4">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        <div className="h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="mt-6 rounded-xl border border-black/10 dark:border-white/10 p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <div role="alert" className="rounded-md border border-red-500/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">
          <strong>오류:</strong> {error}
        </div>
        <Link href="/" className="mt-4 inline-block text-sm text-brand hover:underline">
          ← 목록으로
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const sourceLabel = post.source === "sojoong" ? "SW중심사업단" : "AICOSS";

  return (
    <div className="py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors rounded focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        ← 목록으로
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass(post.category)}`}>
          {post.category}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{sourceLabel}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-100">
        {post.title}
      </h1>

      <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        게시일: <time dateTime={post.posted_at ?? undefined}>{formatDateTime(post.posted_at)}</time>
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        {post.content ? (
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-800 dark:text-zinc-200">
              {post.content}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            본문이 저장되지 않았습니다. 아래 원문에서 확인하세요.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-black/5 pt-5 dark:border-white/5">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-opacity"
          >
            원문 열기 ↗
          </a>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none transition-colors"
          >
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
