"use client";

import * as React from "react";
import { Filters, type FiltersValue } from "../components/filters";
import { PostCard } from "../components/post-card";
import { PostCardSkeleton } from "../components/post-card";
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
      } catch (e: any) {
        setError(e?.message ?? "불러오기에 실패했습니다.");
      } finally {
        setLoading(false);
        setInitialDone(true);
      }
    },
    [filters]
  );

  // 필터 변경 시 debounce 후 초기 로드
  React.useEffect(() => {
    const t = setTimeout(() => {
      setCursor(null);
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
      <h1 className="text-2xl font-bold tracking-tight">공지 / 행사 모아보기</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        전남대학교 SW중심사업단 · AICOSS 공지사항을 한 곳에서 확인하세요. 정확한 내용은 원문 링크를 확인하세요.
      </p>

      <Filters value={filters} onChange={(v) => setFilters(v)} />

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-500/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          <strong>오류:</strong> {error}
          <button
            type="button"
            onClick={() => load(true, null)}
            className="ml-3 underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {/* 스켈레톤 로딩 */}
      {showSkeleton ? (
        <section aria-label="로딩 중" aria-busy="true" className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </section>
      ) : isEmpty ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <p className="text-sm">검색 결과가 없습니다.</p>
          {(filters.q || filters.category !== "전체" || filters.source !== "전체") && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT)}
              className="text-sm text-brand underline hover:no-underline"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <section aria-label="공지 목록" className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {/* 추가 로딩 중 스켈레톤 */}
          {loading && initialDone &&
            Array.from({ length: 2 }).map((_, i) => (
              <PostCardSkeleton key={`more-${i}`} />
            ))
          }
        </section>
      )}

      {!showSkeleton && (cursor || (!loading && items.length > 0)) ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading || !cursor}
            className="rounded-md border border-black/10 bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-brand transition-colors"
          >
            {loading ? "불러오는 중…" : cursor ? "더 보기" : "모두 불러왔습니다"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
