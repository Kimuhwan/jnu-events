import type { Env } from "./types";
import { SOURCES } from "./sources";
import { isoNow } from "./utils";
import { upsertPost, logLine, logRun } from "./db";

export async function runCrawl(env: Env) {
  const runId = crypto.randomUUID();
  const startedAt = isoNow();

  // ✅ 부분 실패가 있어도 전체 크론/런은 성공으로 두고,
  // 실패는 stats + crawl_logs로만 남기는 운영형 방식
  let overallOk = true;

  const stats: Record<string, { listed: number; changed: number; errors: number }> = {};

  try {
    for (const src of SOURCES) {
      stats[src.id] = { listed: 0, changed: 0, errors: 0 };

      try {
        const listed = await src.list(env);
        stats[src.id].listed = listed.length;

        // 부하 방지: 상위 N개만 상세 조회 (필요하면 10~15로 조절)
        const top = listed.slice(0, 12);

        for (const item of top) {
          try {
            const detail = await src.detail(env, item);
            const r = await upsertPost(env, src.id, detail);
            if (r.changed) stats[src.id].changed += 1;

            await sleep(200);
          } catch (e: any) {
            stats[src.id].errors += 1;
            overallOk = false;
            await logLine(env, runId, src.id, "error", `detail fail: ${e?.message ?? String(e)}`);
          }
        }
      } catch (e: any) {
        stats[src.id].errors += 1;
        overallOk = false;
        await logLine(env, runId, src.id, "error", `list fail: ${e?.message ?? String(e)}`);
      }

      await sleep(600);
    }
  } finally {
    const finishedAt = isoNow();
    await logRun(env, runId, overallOk, startedAt, finishedAt, JSON.stringify(stats));
  }

  return { runId, ok: overallOk, stats };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
