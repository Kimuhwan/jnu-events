"use client";

import * as React from "react";
import { Filters, type FiltersValue } from "../components/filters";
import { PostCard } from "../components/post-card";
import { fetchPosts } from "../lib/api";
import type { Post } from "../lib/types";

const DEFAULT: FiltersValue = { q: "", category: "전체", source: "전체" };

export function PostsPage() {
  const [filters, setFilters] = React.useState<FiltersValue>(DEFAULT);
  const [items, setItems] = React.useState<Post[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (reset: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPosts({
        q: filters.q || undefined,
        category: filters.category !== "전체" ? filters.category : undefined,
        source: filters.source !== "전체" ? filters.source : undefined,
        cursor: reset ? undefined : cursor || undefined
      });
      setItems(reset ? res.items : [...items, ...res.items]);
      setCursor(res.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [filters, cursor, items]);

  React.useEffect(() => {
    // debounce
    const t = setTimeout(() => { load(true); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category, filters.source]);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold tracking-tight">공지/행사</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        두 사업단 공지사항을 모아 보여줍니다. 정확한 내용은 원문 링크를 확인하세요.
      </p>

      <Filters value={filters} onChange={(v) => setFilters(v)} />

      {error ? (
        <div role="alert" className="mt-6 rounded-md border border-red-500/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <section aria-label="공지 목록" className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => load(false)}
          disabled={loading || !cursor}
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-brand"
        >
          {loading ? "불러오는 중…" : cursor ? "더 보기" : "끝"}
        </button>
      </div>
    </div>
  );
}
