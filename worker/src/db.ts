import type { Env, SourceId, ListedItem, DetailedItem } from "./types";
import { guessCategory, isoNow, sha256Hex, toId } from "./utils";

export async function upsertPost(env: Env, source: SourceId, detail: DetailedItem) {
  const id = toId(source, detail.remoteId);
  const category = guessCategory(detail.title);
  const hash = await sha256Hex([
    detail.title,
    detail.postedAt ?? "",
    detail.url,
    (detail.content ?? "").slice(0, 2000)
  ].join("|"));

  const now = isoNow();

  const existing = await env.DB.prepare("SELECT hash FROM posts WHERE id = ?1")
    .bind(id)
    .first<{ hash: string }>();

  if (existing?.hash === hash) {
    return { changed: false, id };
  }

  await env.DB.prepare(`
    INSERT INTO posts (id, source, remote_id, title, posted_at, url, excerpt, content, category, hash, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
    ON CONFLICT(id) DO UPDATE SET
      title=excluded.title,
      posted_at=excluded.posted_at,
      url=excluded.url,
      excerpt=excluded.excerpt,
      content=excluded.content,
      category=excluded.category,
      hash=excluded.hash,
      updated_at=excluded.updated_at
  `).bind(
    id, source, detail.remoteId, detail.title,
    detail.postedAt, detail.url,
    detail.excerpt, detail.content,
    category, hash, now, now
  ).run();

  return { changed: true, id };
}

export async function listPosts(env: Env, params: { q?: string; category?: string; source?: string; cursor?: string; limit?: number; }) {
  const limit = Math.min(params.limit ?? 20, 50);
  const cursorDate = params.cursor ? new Date(params.cursor).toISOString() : null;

  const where: string[] = [];
  const bind: any[] = [];
  if (params.q) { where.push("title LIKE ?"); bind.push(`%${params.q}%`); }
  if (params.category) { where.push("category = ?"); bind.push(params.category); }
  if (params.source) { where.push("source = ?"); bind.push(params.source); }
  if (cursorDate) { where.push("(posted_at IS NULL OR posted_at < ?)"); bind.push(cursorDate); }

  const sql = `
    SELECT id, source, remote_id, title, posted_at, url, excerpt, content, category, updated_at
    FROM posts
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY 
      CASE WHEN posted_at IS NULL THEN 1 ELSE 0 END,
      posted_at DESC,
      updated_at DESC
    LIMIT ${limit + 1}
  `;

  const rows = await env.DB.prepare(sql).bind(...bind).all<any>();
  const items = rows.results.slice(0, limit);

  const nextCursor = rows.results.length > limit
    ? (items[items.length - 1]?.posted_at ?? items[items.length - 1]?.updated_at ?? null)
    : null;

  return { items, nextCursor };
}

export async function getPost(env: Env, id: string) {
  const row = await env.DB.prepare(`
    SELECT id, source, remote_id, title, posted_at, url, excerpt, content, category, updated_at
    FROM posts WHERE id = ?1
  `).bind(id).first<any>();
  return row ?? null;
}

export async function logRun(env: Env, runId: string, ok: boolean, startedAt: string, finishedAt?: string, summary?: string) {
  await env.DB.prepare(`
    INSERT INTO crawl_runs (id, started_at, finished_at, ok, summary)
    VALUES (?1, ?2, ?3, ?4, ?5)
  `).bind(runId, startedAt, finishedAt ?? null, ok ? 1 : 0, summary ?? null).run();
}

export async function logLine(env: Env, runId: string, source: string, level: "info"|"warn"|"error", message: string) {
  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO crawl_logs (id, run_id, source, level, message, created_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6)
  `).bind(id, runId, source, level, message, isoNow()).run();
}
