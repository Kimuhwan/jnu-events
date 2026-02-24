export function isoNow() {
  return new Date().toISOString();
}

export function toId(source: string, remoteId: string) {
  return `${source}:${remoteId}`;
}

export function guessCategory(title: string): "행사" | "모집" | "안내" | "기타" {
  const t = title.replace(/\s+/g, "");

  if (/(행사|특강|설명회|세미나|워크숍|워크샵|경진대회|대회|캠프|해커톤|콘테스트|컨퍼런스|포럼|심포지엄|부트캠프|발표회|시연|데모|전시)/.test(t))
    return "행사";

  if (/(모집|선발|신청|접수|지원|채용|구인|인턴|공모|선정|뽑|뽑습|등록)/.test(t))
    return "모집";

  if (/(안내|공지|발표|결과|알림|소식|변경|업데이트|안내사항|일정|중단|휴무|폐지|개편)/.test(t))
    return "안내";

  return "기타";
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    // HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchText(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<string> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function fetchTextWithRetry(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  retries = 2
): Promise<string> {
  let lastErr: any;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchText(url, init, timeoutMs);
    } catch (e) {
      lastErr = e;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  throw lastErr;
}

export function parseKoreanDateLoose(s: string): string | null {
  // 형식: 2024-01-23, 2024.01.23, 2024/01/23, 2024년 1월 23일 등
  const m = s.match(/(20\d{2})[-./년\s](\d{1,2})[-./월\s](\d{1,2})/);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;

  const dt = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0));
  return dt.toISOString();
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
