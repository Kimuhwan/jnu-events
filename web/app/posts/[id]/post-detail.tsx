"use client";

import * as React from "react";
import { fetchPost } from "../../../lib/api";
import type { Post } from "../../../lib/types";
import Link from "next/link";

export function PostDetail({ id }: { id: string }) {
  const [post, setPost] = React.useState<Post | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const p = await fetchPost(id);
        setPost(p);
      } catch (e: any) {
        setError(e?.message ?? "불러오기에 실패했습니다.");
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="py-10">
        <div role="alert" className="rounded-md border border-red-500/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
        <Link href="/" className="mt-4 inline-block text-sm text-brand hover:underline">목록으로</Link>
      </div>
    );
  }

  if (!post) return <div className="py-10 text-sm text-zinc-600 dark:text-zinc-400">불러오는 중…</div>;

  return (
    <div className="py-10">
      <Link href="/" className="text-sm text-brand hover:underline rounded-md focus-visible:ring-2 focus-visible:ring-brand">← 목록으로</Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{post.title}</h1>

      <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {post.source === "sojoong" ? "SW중심사업단" : "AICOSS"} · {post.posted_at ? new Date(post.posted_at).toLocaleString("ko-KR") : "날짜 미상"}
      </div>

      <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
        {post.content ? (
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">{post.content}</pre>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            본문이 저장되지 않았습니다. 아래 원문을 확인하세요.
          </p>
        )}

        <div className="mt-6">
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand"
          >
            원문 열기
          </a>
        </div>
      </div>
    </div>
  );
}
