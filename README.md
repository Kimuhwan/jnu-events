# 전남대학교 공지/행사 모아보기

> 전남대학교 **SW중심사업단**과 **AICOSS(인공지능혁신융합사업단)** 공지사항을 크롤링하여  
> 한 곳에서 검색·필터링·상세보기 할 수 있는 서비스입니다.

| 수집 소스 | URL |
|---|---|
| SW중심사업단 | https://sojoong.kr/notice/notice-board/ |
| AICOSS | https://aicoss.ac.kr/www/notice/?cate=전남대학교 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│  Cloudflare Pages  (Next.js 15 / Edge Runtime)      │
│  web/                                               │
│  - 공지 목록 / 검색 / 필터 / 상세보기               │
└───────────────────────┬─────────────────────────────┘
                        │ fetch /api/*
┌───────────────────────▼─────────────────────────────┐
│  Cloudflare Workers  (TypeScript)                   │
│  worker/                                            │
│  - REST API   : GET /api/posts, /api/posts/:id      │
│  - Cron       : 매일 03:00 KST 크롤링 실행          │
│  - D1 (SQLite): posts / crawl_runs / crawl_logs     │
└─────────────────────────────────────────────────────┘
```

> ⚠️ 크롤링은 대상 사이트의 robots.txt / 이용약관을 준수하세요.  
> 서버 부하를 줄이기 위해 **1일 1회** + 요청 간 딜레이를 적용합니다.

---

## 로컬 실행 방법

### 사전 준비

- **Node.js** 18 이상 (`node -v` 로 확인)
- **npm** 9 이상
- **Cloudflare 계정** (로컬 D1 시뮬레이션을 위해 Wrangler 로그인 필요)

---

### 1단계 — Worker(API) 실행

```bash
# 1. 폴더 이동 및 패키지 설치
cd worker
npm install

# 2. Wrangler 로그인 (처음 한 번만)
npx wrangler login

# 3. 로컬 D1 DB 마이그레이션 (처음 한 번만)
npx wrangler d1 execute jnu_events --local --file=./schema.sql

# 4. 환경 변수 설정 (선택 — Admin API 사용 시 필요)
#    .dev.vars.example 을 .dev.vars 로 복사 후 토큰 설정
copy .dev.vars.example .dev.vars

# 5. 로컬 개발 서버 시작 (기본 포트: 8787)
npx wrangler dev
```

> `http://localhost:8787/api/health` 에서 `{"ok":true}` 가 나오면 정상입니다.

#### 수동 크롤링 (로컬)

Worker 실행 중에 아래 명령으로 즉시 크롤링을 실행할 수 있습니다:

```bash
curl -X POST http://localhost:8787/api/admin/crawl
```

---

### 2단계 — Web(프론트엔드) 실행

새 터미널을 열고:

```bash
# 1. 폴더 이동 및 패키지 설치
cd web
npm install

# 2. 환경 변수 설정 (처음 한 번만)
#    Worker가 8787 포트에서 실행 중이어야 합니다
copy .env.local.example .env.local

# 3. 개발 서버 시작 (기본 포트: 3000)
npm run dev
```

> `http://localhost:3000` 에서 사이트를 확인할 수 있습니다.

---

## Cloudflare 배포 방법

### 3단계 — D1 데이터베이스 생성

```bash
cd worker

# D1 DB 생성
npx wrangler d1 create jnu_events

# 출력된 database_id 를 worker/wrangler.toml 의 database_id 에 붙여넣기
# [[d1_databases]]
# database_id = "여기에-붙여넣기"

# 스키마 적용 (원격)
npx wrangler d1 execute jnu_events --remote --file=./schema.sql
```

### 4단계 — Admin 시크릿 등록

```bash
cd worker
# ADMIN_TOKEN을 Cloudflare 시크릿으로 안전하게 등록
npx wrangler secret put ADMIN_TOKEN
# 프롬프트에 안전한 토큰 값을 입력하세요
```

> ⚠️ `wrangler.toml`에 `ADMIN_TOKEN`을 평문으로 넣지 마세요. 시크릿으로 관리하세요.

### 5단계 — Worker 배포

```bash
cd worker
npx wrangler deploy
```

배포 후 `https://jnu-events-worker.{계정}.workers.dev/api/health` 로 확인하세요.

### 6단계 — 수동 크롤링 실행 (배포 후 초기 데이터 확보)

```bash
curl -X POST "https://jnu-events-worker.{계정}.workers.dev/api/admin/crawl" \
     -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

### 7단계 — 프론트엔드 배포 (Cloudflare Pages)

1. Cloudflare 대시보드 → Pages → "새 프로젝트" → GitHub 연결
2. 빌드 설정:

| 항목 | 값 |
|---|---|
| 루트 디렉토리 | `web` |
| 빌드 명령 | `npm run build` |
| 빌드 출력 | `.next` |
| Node.js 버전 | `18` |

3. 환경 변수 설정 (Pages 대시보드 → Settings → Environment variables):

| 변수명 | 값 |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://jnu-events-worker.{계정}.workers.dev` |

또는 `@cloudflare/next-on-pages`를 사용하는 경우:

```bash
cd web
npm run build:cf
# .vercel/output/static 을 Pages에 업로드
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| `GET` | `/api/health` | 헬스체크 |
| `GET` | `/api/posts` | 공지 목록 (검색/필터/페이징) |
| `GET` | `/api/posts/:id` | 공지 상세 |
| `POST` | `/api/admin/crawl` | 수동 크롤링 (로컬 또는 토큰 필요) |
| `GET` | `/api/admin/logs` | 크롤 로그 조회 (로컬 또는 토큰 필요) |
| `GET` | `/api/admin/runs` | 크롤 실행 이력 (로컬 또는 토큰 필요) |

### `/api/posts` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `q` | string | 제목 키워드 검색 |
| `category` | `행사` \| `모집` \| `안내` \| `기타` | 분류 필터 |
| `source` | `sojoong` \| `aicoss` | 소스 필터 |
| `cursor` | string (ISO 날짜) | 커서 기반 페이지네이션 |
| `limit` | number (최대 50) | 한 번에 가져올 개수 |

---

## 새 소스(사업단) 추가 방법

1. `worker/src/types.ts` 의 `SourceId` 타입에 새 ID 추가:
   ```ts
   export type SourceId = "sojoong" | "aicoss" | "새소스ID";
   ```

2. `worker/src/sources/새소스ID.ts` 파일 작성:
   ```ts
   import type { Source } from "./base";
   export const newSource: Source = {
     id: "새소스ID",
     label: "사업단 이름",
     async list(env) { /* ... */ },
     async detail(env, item) { /* ... */ },
   };
   ```

3. `worker/src/sources/index.ts` 에 등록:
   ```ts
   import { newSource } from "./새소스ID";
   export const SOURCES: Source[] = [sojoongSource, aicossSource, newSource];
   ```

---

## 프로젝트 구조

```
jnu-events-mvp/
├── web/                         # Next.js 프론트엔드
│   ├── app/
│   │   ├── page.tsx             # 메인 페이지 (공지 목록)
│   │   ├── posts-page.tsx       # 목록 클라이언트 컴포넌트
│   │   ├── layout.tsx
│   │   └── posts/[id]/          # 공지 상세 페이지
│   ├── components/
│   │   ├── filters.tsx          # 검색/필터 UI
│   │   ├── post-card.tsx        # 공지 카드 + 스켈레톤
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── theme-provider.tsx   # 다크모드
│   ├── lib/
│   │   ├── api.ts               # API 클라이언트
│   │   └── types.ts             # 공유 타입
│   ├── .env.local.example       # 로컬 환경 변수 예시
│   └── tailwind.config.ts
│
└── worker/                      # Cloudflare Worker
    ├── src/
    │   ├── index.ts             # 진입점 (fetch + scheduled)
    │   ├── router.ts            # API 라우팅
    │   ├── crawler.ts           # 크롤링 오케스트레이터
    │   ├── db.ts                # D1 쿼리
    │   ├── utils.ts             # 유틸리티 (HTML 파싱, 날짜 등)
    │   ├── types.ts             # 공유 타입
    │   └── sources/
    │       ├── base.ts          # Source 인터페이스
    │       ├── sojoong.ts       # SW중심사업단 크롤러
    │       └── aicoss.ts        # AICOSS 크롤러
    ├── schema.sql               # D1 스키마
    ├── wrangler.toml
    └── .dev.vars.example        # 로컬 시크릿 예시
```

---

## 로고 교체 방법

현재 `web/public/brand/jnu-logo.svg`에 임시 로고가 들어있습니다.

공식 로고로 교체하려면:
1. 공식 SVG를 `web/public/brand/jnu-logo.svg`로 덮어쓰기
2. 필요 시 `web/app/icon.png`, `web/app/apple-icon.png`도 교체

---

## 접근성(A11y)

- 키보드 네비게이션 / 포커스 링
- 스킵 링크 ("본문으로 건너뛰기")
- 시맨틱 마크업 (`<article>`, `<time>`, `<nav>` 등)
- 색 대비 확보 (라이트/다크 모드)
- `aria-label`, `aria-busy`, `role="alert"`
