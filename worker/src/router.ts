import type { Env } from "./types";
import { getPost, listPosts } from "./db";
import { runCrawl } from "./crawler";

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init?.headers ?? {})
    }
  });
}

function cors(res: Response) {
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", "*");
  h.set("access-control-allow-methods", "GET, POST, OPTIONS");
  h.set("access-control-allow-headers", "content-type, x-admin-token");
  return new Response(res.body, { status: res.status, headers: h });
}

function isLocal(req: Request): boolean {
  const host = req.headers.get("host") || "";
  return host.includes("127.0.0.1") || host.includes("localhost");
}

function hasAdminToken(req: Request, env: Env, url: URL): boolean {
  const token = req.headers.get("x-admin-token") || url.searchParams.get("token");
  return !!token && token === (env.ADMIN_TOKEN ?? "");
}

export async function handleApi(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);

  // ─── CORS preflight (OPTIONS) ─────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }

  // ─── GET /api/health ──────────────────────────────────────────────────
  if (url.pathname === "/api/health" && req.method === "GET") {
    return cors(json({ ok: true, time: new Date().toISOString() }));
  }

  // ─── GET /api/posts ───────────────────────────────────────────────────
  if (url.pathname === "/api/posts" && req.method === "GET") {
    const q        = url.searchParams.get("q")        ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const source   = url.searchParams.get("source")   ?? undefined;
    const cursor   = url.searchParams.get("cursor")   ?? undefined;
    const limitRaw = parseInt(url.searchParams.get("limit") ?? "20", 10);
    const limit    = Number.isFinite(limitRaw) ? Math.min(limitRaw, 50) : 20;

    const data = await listPosts(env, { q, category, source, cursor, limit });
    return cors(json(data));
  }

  // ─── GET /api/posts/:id ───────────────────────────────────────────────
  const postMatch = url.pathname.match(/^\/api\/posts\/(.+)$/);
  if (postMatch && req.method === "GET") {
    const id   = decodeURIComponent(postMatch[1]);
    const post = await getPost(env, id);
    if (!post) return cors(json({ error: "not_found" }, { status: 404 }));
    return cors(json(post));
  }

  // ─── Admin routes ─────────────────────────────────────────────────────
  // 로컬 개발 OR 유효한 ADMIN_TOKEN 중 하나라도 통과하면 허용
  const isAdmin = isLocal(req) || hasAdminToken(req, env, url);

  // POST /api/admin/crawl — 수동 크롤 트리거
  if (url.pathname === "/api/admin/crawl" && req.method === "POST") {
    if (!isAdmin) return cors(json({ error: "forbidden" }, { status: 403 }));
    const result = await runCrawl(env);
    return cors(json(result));
  }

  // GET /api/admin/logs — 최근 크롤 로그 조회
  if (url.pathname === "/api/admin/logs" && req.method === "GET") {
    if (!isAdmin) return cors(json({ error: "forbidden" }, { status: 403 }));

    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
    const rows = await env.DB.prepare(
      `SELECT run_id, source, level, message, created_at
       FROM crawl_logs
       ORDER BY created_at DESC
       LIMIT ?1`
    ).bind(limit).all();

    return cors(json(rows.results));
  }

  // GET /api/admin/runs — 크롤 실행 이력 조회
  if (url.pathname === "/api/admin/runs" && req.method === "GET") {
    if (!isAdmin) return cors(json({ error: "forbidden" }, { status: 403 }));

    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const rows = await env.DB.prepare(
      `SELECT id, started_at, finished_at, ok, summary
       FROM crawl_runs
       ORDER BY started_at DESC
       LIMIT ?1`
    ).bind(limit).all();

    return cors(json(rows.results));
  }

  return cors(json({ error: "not_found" }, { status: 404 }));
}
