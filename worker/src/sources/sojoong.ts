import type { Source } from "./base";
import type { Env, ListedItem } from "../types";
import { fetchTextWithRetry, parseKoreanDateLoose, stripHtml } from "../utils";

const LIST_URL = "https://sojoong.kr/notice/notice-board/";

function absUrl(href: string) {
  const clean = href.replace(/&amp;/g, "&").trim();
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/")) return `https://sojoong.kr${clean}`;
  return `https://sojoong.kr/${clean}`;
}

export const sojoongSource: Source = {
  id: "sojoong",
  label: "전남대학교 소프트웨어중심사업단",

  async list(env: Env) {
    const html = await fetchTextWithRetry(
      LIST_URL,
      {
        headers: {
          "User-Agent": env.USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        },
      },
      Number(env.CRAWL_TIMEOUT_MS)
    );

    const hrefRe = /href=["']([^"']*uid=\d+[^"']*)["']/gi;
    const map = new Map<string, { url: string; title: string }>();

    let m: RegExpExecArray | null;
    while ((m = hrefRe.exec(html))) {
      const hrefRaw = m[1];
      if (!hrefRaw.includes("mod=document")) continue;

      const uidMatch = hrefRaw.match(/uid=(\d+)/);
      if (!uidMatch) continue;

      const uid = uidMatch[1];
      map.set(uid, {
        url: absUrl(hrefRaw),
        title: "",
      });
    }

    const items: ListedItem[] = [...map.entries()].map(([uid, v]) => ({
      remoteId: uid,
      title: v.title || `공지 ${uid}`,
      postedAt: null,
      url: v.url,
    }));

    items.sort((a, b) => Number(b.remoteId) - Number(a.remoteId));
    return items.slice(0, 30);
  },

  async detail(env: Env, item: ListedItem) {
    const html = await fetchTextWithRetry(
      item.url,
      {
        headers: {
          "User-Agent": env.USER_AGENT,
          Accept: "text/html",
        },
      },
      Number(env.CRAWL_TIMEOUT_MS)
    );

    const titleMatch =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ??
      html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);

    const title = stripHtml(titleMatch?.[1] ?? item.title).slice(0, 300);

    const dateContext = html.match(/작성\s*일[\s\S]{0,120}/i)?.[0] ?? html;
    const postedAt = parseKoreanDateLoose(dateContext);

    const main =
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ??
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ??
      html;

    const content = stripHtml(main);

    return {
      ...item,
      title,
      postedAt,
      content,
      excerpt: content.slice(0, 180),
    };
  },
};
