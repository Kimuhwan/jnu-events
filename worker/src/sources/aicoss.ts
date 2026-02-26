import type { Source } from "./base";
import type { Env, ListedItem } from "../types";
import { fetchTextWithRetry, parseKoreanDateLoose, stripHtml } from "../utils";

const LIST_URL =
  "https://aicoss.ac.kr/www/notice/?cate=%EC%A0%84%EB%82%A8%EB%8C%80%ED%95%99%EA%B5%90";

export const aicossSource: Source = {
  id: "aicoss",
  label: "전남대학교 인공지능혁신융합사업단",

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

    const map = new Map<string, { url: string; title: string }>();

    // 방법 1: href="/www/notice/view/숫자" 형태 링크에서 id + 제목 추출
    const linkRe = /<a\s[^>]*href=["']([^"']*\/notice\/view\/(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(html))) {
      const id = m[2];
      const n = Number(id);
      if (!Number.isFinite(n) || n < 1000) continue;

      const rawText = stripHtml(m[3]).trim();
      if (!rawText || rawText.length < 3) continue;

      if (!map.has(id) || map.get(id)!.title.length < rawText.length) {
        map.set(id, {
          url: `https://aicoss.ac.kr/www/notice/view/${id}`,
          title: rawText.slice(0, 200),
        });
      }
    }

    // 방법 2 (fallback): 링크가 없을 경우 텍스트 줄 파싱
    if (map.size === 0) {
      const text = stripHtml(html);
      const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
      for (const line of lines) {
        const lm = line.match(/^(\d{1,6})\b/);
        if (!lm) continue;
        const id = lm[1];
        const n = Number(id);
        if (!Number.isFinite(n) || n < 1000) continue;

        const titleGuess = line.replace(/^(\d{1,6})\s*/, "").slice(0, 200).trim();
        map.set(id, {
          url: `https://aicoss.ac.kr/www/notice/view/${id}`,
          title: titleGuess,
        });
      }
    }

    const items: ListedItem[] = [...map.entries()].map(([id, v]) => ({
      remoteId: id,
      title: v.title || `공지 ${id}`,
      postedAt: null,
      url: v.url,
    }));

    items.sort((a, b) => Number(b.remoteId) - Number(a.remoteId));
    return items.slice(0, 30);
  },

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
      if (msg.includes("Fetch failed 500")) {
        return { ...item, content: null, excerpt: null };
      }
      throw e;
    }

    // h2~h4에서 실제 게시물 제목 추출 (h1은 사이트 제목임)
    let title = item.title;
    const headingRe = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let hm: RegExpExecArray | null;
    while ((hm = headingRe.exec(html))) {
      const text = stripHtml(hm[2]).trim();
      if (text.length >= 5 && !/^(공지|게시판|notice|board|알림|공지사항)$/i.test(text)) {
        title = text.slice(0, 300);
        break;
      }
    }

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
