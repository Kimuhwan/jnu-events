import type { Source } from "./base";
import type { Env, ListedItem } from "../types";
import { fetchTextWithRetry, parseKoreanDateLoose, stripHtml } from "../utils";

const LIST_URL = "https://sojoong.kr/notice/notice-board/";

function absUrl(href: string) {
  const clean = href
    .replace(/&#038;/g, "&")   // &#038; → &
    .replace(/&amp;/g, "&")    // &amp; → &
    .trim();
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/")) return `https://sojoong.kr${clean}`;
  return `https://sojoong.kr/${clean}`;
}

/**
 * class 속성에 특정 클래스가 모두 포함되어 있는지 확인
 */
function hasClasses(classAttr: string, ...classes: string[]): boolean {
  return classes.every((c) => classAttr.includes(c));
}

/**
 * <div class="...custom-title...">제목</div> 에서 텍스트 추출
 * 중첩 div가 있을 수 있으므로 안쪽 텍스트만 추출
 */
function extractTitleFromATag(aInnerHtml: string): string {
  // class에 "custom-title"이 포함된 div를 찾음
  // 첫 번째 div는 빈 div, 두 번째가 제목 div
  const divRe = /<div([^>]*)>([\s\S]*?)<\/div>/gi;
  const found: { cls: string; text: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = divRe.exec(aInnerHtml))) {
    const cls = m[1].match(/class=["']([^"']*)["']/i)?.[1] ?? "";
    const text = stripHtml(m[2]).trim();
    found.push({ cls, text });
  }

  // class에 custom-title이 포함된 div 중 텍스트가 있는 것 우선
  for (const { cls, text } of found) {
    if (cls.includes("custom-title") && text.length >= 3) {
      return text;
    }
  }

  // fallback: 텍스트가 있는 첫 번째 div
  for (const { text } of found) {
    if (text.length >= 3) return text;
  }

  return "";
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

    const items: ListedItem[] = [];

    // <tr> 단위로 분리
    const trRe = /<tr([^>]*)>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;

    while ((trMatch = trRe.exec(html))) {
      const trAttrs = trMatch[1];
      const trInner = trMatch[2];

      // kboard-list-notice 클래스 = 고정 공지 → 제외
      if (/kboard-list-notice/i.test(trAttrs)) continue;

      // uid 포함 href 추출
      const hrefMatch = trInner.match(/href=["']([^"']*uid=(\d+)[^"']*)["']/i);
      if (!hrefMatch) continue;

      const uid = hrefMatch[2];
      const url = absUrl(hrefMatch[1]);

      // <a href="..."> 태그 내부 추출
      const aMatch = trInner.match(/<a\s[^>]*href=["'][^"']*uid=\d+[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
      const title = aMatch ? extractTitleFromATag(aMatch[1]) : "";

      // 날짜: 해당 tr 내의 kboard-date 또는 custom-date 클래스 span
      // 형식: "2026.02.09" 또는 "2026-02-09"
      const dateSpanMatch = trInner.match(
        /<span[^>]*class=["'][^"']*(?:kboard-date|custom-date)[^"']*["'][^>]*>([^<]+)<\/span>/i
      );
      const dateStr = dateSpanMatch ? dateSpanMatch[1].trim() : null;
      const postedAt = dateStr ? parseKoreanDateLoose(dateStr) : null;

      if (!title || title.length < 2) continue;

      items.push({
        remoteId: uid,
        title: title.slice(0, 200),
        postedAt,
        url,
      });
    }

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

    // 제목: 목록에서 가져온 값 우선, 없으면 .kboard-title > h1/h2에서 추출
    let title = item.title;
    if (!title) {
      const titleMatch = html.match(/<div[^>]*class=["'][^"']*kboard-title[^"']*["'][^>]*>[\s\S]*?<(?:h1|h2)[^>]*>([\s\S]*?)<\/(?:h1|h2)>/i);
      if (titleMatch) title = stripHtml(titleMatch[1]).trim().slice(0, 300);
    }

    // 날짜: 목록 파싱값 우선, 없으면 .detail-value에서 추출
    // HTML: <div class="detail-attr detail-date"><div class="detail-name">작성일</div><div class="detail-value">2026-02-09 17:05</div></div>
    let postedAt = item.postedAt;
    if (!postedAt) {
      const detailValueMatch = html.match(
        /<div[^>]*class=["'][^"']*detail-date[^"']*["'][^>]*>[\s\S]*?<div[^>]*class=["'][^"']*detail-value[^"']*["'][^>]*>([^<]+)<\/div>/i
      );
      const dateStr = detailValueMatch ? detailValueMatch[1].trim() : null;
      postedAt = dateStr ? parseKoreanDateLoose(dateStr) : null;
    }

    // 본문: div.kboard-content (class에 kboard-content 포함, itemprop 등 다른 속성 있을 수 있음)
    const contentTagMatch = html.match(/<div[^>]*class="[^"]*kboard-content[^"]*"[^>]*>/i)
      ?? html.match(/<div[^>]*class='[^']*kboard-content[^']*'[^>]*>/i);
    const contentStart = contentTagMatch ? html.indexOf(contentTagMatch[0]) : -1;
    const contentHtml = contentStart > -1
      ? html.slice(contentStart, contentStart + 10000)
      : "";
    const content = stripHtml(contentHtml).trim();


    return {
      ...item,
      title,
      postedAt,
      content: content || null,
      excerpt: content ? content.slice(0, 180) : null,
    };
  },
};
