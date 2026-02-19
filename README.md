# JNU 행사/공지 모아보기 (MVP, 확장형 구조)

두 사이트 공지사항을 수집해 한 곳에서 검색/필터링/상세보기 할 수 있는 MVP입니다.

- 소프트웨어중심사업단: https://sojoong.kr/notice/notice-board/
- 인공지능혁신융합사업단: https://aicoss.ac.kr/www/notice/?cate=전남대학교

## 아키텍처
- **Front**: Next.js + Tailwind (Cloudflare Pages 배포)
- **API + 크롤러 + DB**: Cloudflare Workers + D1 + Cron Trigger

> 크롤링은 대상 사이트의 robots.txt / 이용약관을 준수하세요. 서버 부하를 줄이기 위해 1일 1회 + 요청 분산/캐시를 적용했습니다.

---

## 0) 전남대 로고(고급 아이콘) 적용
본 repo에는 **임시 로고 SVG**(web/public/brand/jnu-logo.svg)가 들어 있습니다.

권장: 공식 UI/CI 가이드 또는 위키미디어에 있는 로고 파일을 사용해 교체하세요.
- Wikimedia Commons: Logo of Chonnam National University.svg (출처: jnu.ac.kr)  
- 전남대학교 UI 안내 페이지: jnu.ac.kr의 "대학상징/전남대UI" 관련 페이지 참고

교체 방법:
1) `web/public/brand/jnu-logo.svg` 를 공식 SVG로 덮어쓰기
2) 필요 시 `web/app/icon.png`, `web/app/apple-icon.png`도 함께 교체

---

## 1) 로컬 실행

### Front
```bash
cd web
npm i
npm run dev
```

### Worker (API)
```bash
cd worker
npm i
npx wrangler dev
```

---

## 2) Cloudflare 배포

### 2-1) D1 생성 & 마이그레이션
```bash
cd worker
npx wrangler d1 create jnu_events
npx wrangler d1 execute jnu_events --file=./schema.sql
```

wrangler가 출력하는 DB id를 `worker/wrangler.toml`의 `database_id`에 반영하세요.

### 2-2) Worker 배포
```bash
cd worker
npx wrangler deploy
```

### 2-3) Cron 스케줄(Workers)
`worker/wrangler.toml`에 cron이 포함되어 있습니다.
배포 후 Cloudflare 대시보드에서 스케줄이 활성화됐는지 확인하세요.

### 2-4) Front 배포 (Cloudflare Pages)
Cloudflare Pages에서 GitHub repo 연결 후:
- Build command: `npm run build`
- Build output: `.next` (Next on Pages 설정에 따라 다를 수 있어, 아래 안내 참고)
- Root: `web`

권장: Cloudflare의 Next.js preset을 사용하거나, `@cloudflare/next-on-pages`로 빌드하세요.
이 repo는 `@cloudflare/next-on-pages` 설정을 포함했습니다.

```bash
cd web
npm i
npm run build:cf
```

---

## 3) 확장(사업단 추가)
`worker/src/sources/`에 소스 모듈을 하나 추가하고, `worker/src/sources/index.ts`에 등록하면 끝입니다.

---

## 4) 접근성(A11y) & 품질
- 키보드 네비게이션/포커스 링
- 스킵 링크
- 시맨틱 마크업(리스트/헤딩)
- 색 대비(기본 대비 확보, 다크모드 지원)
- `aria-label`, `sr-only` 텍스트

