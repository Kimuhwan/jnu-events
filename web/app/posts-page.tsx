"use client";

import * as React from "react";
import { Filters, type FiltersValue } from "../components/filters";
import { PostCard, PostCardSkeleton } from "../components/post-card";
import { fetchPosts } from "../lib/api";
import type { Post } from "../lib/types";

const DEFAULT: FiltersValue = { q: "", category: "전체", source: "전체" };

export function PostsPage() {
  const [filters, setFilters] = React.useState<FiltersValue>(DEFAULT);
  const [items, setItems] = React.useState<Post[]>([]);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [initialDone, setInitialDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number | null>(null);

  const load = React.useCallback(
    async (reset: boolean, currentCursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPosts({
          q: filters.q || undefined,
          category: filters.category !== "전체" ? filters.category : undefined,
          source: filters.source !== "전체" ? filters.source : undefined,
          cursor: reset ? undefined : currentCursor ?? undefined,
        });
        setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
        setCursor(res.nextCursor);
        if (reset) setTotal(res.items.length);
        else setTotal((t) => (t ?? 0) + res.items.length);
      } catch (e: any) {
        setError(e?.message ?? "불러오기에 실패했습니다.");
      } finally {
        setLoading(false);
        setInitialDone(true);
      }
    },
    [filters]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      setCursor(null);
      setTotal(null);
      load(true, null);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category, filters.source]);

  const handleLoadMore = () => load(false, cursor);
  const showSkeleton = loading && !initialDone;
  const isEmpty = initialDone && !loading && items.length === 0 && !error;

  return (
    <div className="py-8">
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            공지 · 행사 모아보기
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            전남대 SW중심사업단 · AICOSS 공지를 한 눈에
          </p>
        </div>
        {total !== null && !error && (
          <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {total}건{cursor ? "+" : ""}
          </span>
        )}
      </div>

      <Filters value={filters} onChange={(v) => setFilters(v)} />

      {/* 에러 */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200 flex items-center justify-between"
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => load(true, null)}
            className="ml-4 shrink-0 rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-1 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 스켈레톤 */}
      {showSkeleton ? (
        <section aria-label="로딩 중" aria-busy="true" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </section>
      ) : isEmpty ? (
        <div className="mt-20 flex flex-col items-center gap-4 text-zinc-400 dark:text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-sm font-medium">검색 결과가 없습니다</p>
          {(filters.q || filters.category !== "전체" || filters.source !== "전체") && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT)}
              className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <section aria-label="공지 목록" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {loading && initialDone &&
            Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={`more-${i}`} />
            ))
          }
        </section>
      )}

      {/* 더 보기 */}
      {!showSkeleton && (cursor || (!loading && items.length > 0)) && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading || !cursor}
            className="rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#008231] focus-visible:outline-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                불러오는 중…
              </span>
            ) : cursor ? "더 보기" : "모두 불러왔습니다 ✓"}
          </button>
        </div>
      )}
    </div>
  );
}
