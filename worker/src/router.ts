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
  h.set("access-control-allow-methods", "GET, OPTIONS");
  h.set("access-control-allow-headers", "content-type");
  return new Response(res.body, { status: res.status, headers: h });
}

export async function handleApi(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === "/api/admin/logs" && req.method === "GET") {
  const host = req.headers.get("host") || "";
  const isLocal = host.includes("127.0.0.1") || host.includes("localhost");
  if (!isLocal) return cors(json({ error: "forbidden" }, { status: 403 }));

  const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);

  const rows = await env.DB.prepare(
    `SELECT run_id, source, level, message, created_at
     FROM crawl_logs
     ORDER BY created_at DESC
     LIMIT ?1`
  ).bind(limit).all();

  return cors(json(rows.results));
  }
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));

  if (url.pathname === "/api/health") {
    return cors(json({ ok: true, time: new Date().toISOString() }));
  }
  if (url.pathname === "/api/admin/crawl" && req.method === "POST") {
  // 로컬(dev)에서만 허용: 원격 배포 환경에선 막기
  const host = req.headers.get("host") || "";
  const isLocal = host.includes("127.0.0.1") || host.includes("localhost");
  if (!isLocal) return cors(json({ error: "forbidden" }, { status: 403 }));

  const result = await runCrawl(env);
  return cors(json(result));
  }
  if (url.pathname === "/api/posts") {
    const q = url.searchParams.get("q") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const source = url.searchParams.get("source") ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const data = await listPosts(env, { q, category, source, cursor, limit: 20 });
    return cors(json(data));
  }

  const postMatch = url.pathname.match(/^\/api\/posts\/(.+)$/);
  if (postMatch) {
    const id = decodeURIComponent(postMatch[1]);
    const post = await getPost(env, id);
    if (!post) return cors(json({ error: "not_found" }, { status: 404 }));
    return cors(json(post));
  }

  return cors(json({ error: "not_found" }, { status: 404 }));
}
