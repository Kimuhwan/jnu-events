import type { Env } from "./types";
import { SOURCES } from "./sources";
import { isoNow } from "./utils";
import { upsertPost, logLine, logRun } from "./db";

// 한 소스에서 크롤링할 최대 상세 글 수
const DETAIL_LIMIT = 20;

export async function runCrawl(env: Env) {
  const runId = crypto.randomUUID();
  const startedAt = isoNow();

  // 부분 실패가 있어도 전체 크론/런은 성공으로 두고,
  // 실패는 stats + crawl_logs로만 남기는 운영형 방식
  let overallOk = true;

  const stats: Record<string, { listed: number; changed: number; errors: number }> = {};

  try {
    for (const src of SOURCES) {
      stats[src.id] = { listed: 0, changed: 0, errors: 0 };

      try {
        const listed = await src.list(env);
        stats[src.id].listed = listed.length;

        await logLine(env, runId, src.id, "info", `listed ${listed.length} items`);

        // 부하 방지: 최근 N개만 상세 조회
        const top = listed.slice(0, DETAIL_LIMIT);

        for (const item of top) {
          try {
            const detail = await src.detail(env, item);
            const r = await upsertPost(env, src.id, detail);
            if (r.changed) stats[src.id].changed += 1;

            // 소스 서버 부하 방지
            await sleep(300);
          } catch (e: any) {
            stats[src.id].errors += 1;
            overallOk = false;
            await logLine(env, runId, src.id, "error", `detail fail [${item.remoteId}]: ${e?.message ?? String(e)}`);
          }
        }
      } catch (e: any) {
        stats[src.id].errors += 1;
        overallOk = false;
        await logLine(env, runId, src.id, "error", `list fail: ${e?.message ?? String(e)}`);
      }

      // 소스 간 간격
      await sleep(800);
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
