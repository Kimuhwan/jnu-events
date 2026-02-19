import type { Source } from "./base";
import type { Env, ListedItem } from "../types";
import { fetchTextWithRetry, parseKoreanDateLoose, stripHtml } from "../utils";

const LIST_URL =
  "https://aicoss.ac.kr/www/notice/?cate=%EC%A0%84%EB%82%A8%EB%8C%80%ED%95%99%EA%B5%90";

export const aicossSource: Source = {
  id: "aicoss",
  label: "전남대학교 인공지능혁신융합사업단",

  // A) 목록에서 너무 오래된 글(서버 500 잘 나는 구간)을 아예 제외
  async list(env: Env) {
    const html = await fetchTextWithRetry(
      LIST_URL,
      {
        headers: {
          "User-Agent": env.USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
        },
      },
      Number(env.CRAWL_TIMEOUT_MS),
      2
    );

    const text = stripHtml(html);
    const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);

    const map = new Map<string, { url: string; title: string }>();

    for (const line of lines) {
      // 라인 시작의 "게시물 번호" 추출
      const m = line.match(/^(\d{1,6})\b/);
      if (!m) continue;

      const id = m[1];
      const n = Number(id);
      if (!Number.isFinite(n)) continue;

      // ✅ A) 1000 미만은 상세에서 500이 잘 나는 구간이라 제외 (필요하면 조정)
      if (n < 1000) continue;

      const titleGuess = line.replace(/^(\d{1,6})\s*/, "").slice(0, 200).trim();

      map.set(id, {
        url: `https://aicoss.ac.kr/www/notice/view/${id}`,
        title: titleGuess,
      });
    }

    const items: ListedItem[] = [...map.entries()].map(([id, v]) => ({
      remoteId: id,
      title: v.title || `공지 ${id}`,
      postedAt: null,
      url: v.url,
    }));

    items.sort((a, b) => Number(b.remoteId) - Number(a.remoteId));

    // ✅ 최근 글만 상위 30개
    return items.slice(0, 30);
  },

  // B) 상세에서 500이면 본문 없이 저장(스킵하지 않고 "링크만 남김")
  async detail(env: Env, item: ListedItem) {
    let html: string;

    try {
      html = await fetchTextWithRetry(
        item.url,
        {
          headers: {
            "User-Agent": env.USER_AGENT,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
          },
        },
        Number(env.CRAWL_TIMEOUT_MS),
        2
      );
    } catch (e: any) {
      const msg = String(e?.message ?? e);

      // ✅ B) 서버 자체 오류(500)이면 제목/링크만 남기고 본문은 null로
      if (msg.includes("Fetch failed 500")) {
        return { ...item, content: null, excerpt: null };
      }

      // 다른 에러는 상위에서 로그/카운트 되게 throw
      throw e;
    }

    const titleMatch =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ??
      html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);

    const title = stripHtml(titleMatch?.[1] ?? item.title).slice(0, 300) || item.title;

    const dateContext =
      html.match(/(작성|등록|게시)\s*일[\s\S]{0,120}/i)?.[0] ?? html;
    const postedAt = parseKoreanDateLoose(dateContext);

    const main =
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ??
      html;

    const content = stripHtml(main);

    return {
      ...item,
      title,
      postedAt: postedAt ?? item.postedAt,
      content: content || null,
      excerpt: content ? content.slice(0, 180) : null,
    };
  },
};
