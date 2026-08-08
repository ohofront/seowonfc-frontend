# 서원 FC 프론트엔드 개발 지시서 (Codex용)

> 이 문서는 AI 코딩 에이전트(Codex)가 서원 FC 홈페이지 프론트엔드를 개발할 때 참고하는 지시서입니다.
> 작업 전 이 문서 전체를 읽고, 구조와 우선순위를 이해한 뒤 순서대로 구현해주세요.

---

## 1. 프로젝트 개요

- **프로젝트명**: 서원 FC (동호회) 홈페이지 프론트엔드
- **저장소**: https://github.com/ohofront/seowonfc-frontend.git
- **배포**: Netlify
- **커스텀 도메인**: https://www.seowonfc.com
- **디자인 목표**: 모바일/태블릿/데스크톱 전 구간 대응하는 **반응형 웹사이트**
- **백엔드 API**: Spring Boot로 구현된 REST API (별도 배포됨)
  - 개발/테스트용 API 서버: `https://seowonfc-api.onrender.com/api/v1`
  - Swagger 문서: `https://seowonfc-api.onrender.com/swagger-ui/index.html`

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | React + Vite | 빠른 빌드, Netlify 정적 호스팅과 궁합 좋음 |
| 언어 | TypeScript | API 응답 타입을 명확히 관리 |
| 스타일링 | Tailwind CSS | 반응형 유틸리티 클래스로 빠르게 반응형 구현 |
| 라우팅 | React Router v6 | SPA 페이지 전환 |
| API 통신 | Axios (또는 fetch) | 인터셉터로 JWT 토큰 자동 첨부 |
| 상태관리 | React Context + useState/useReducer (전역 상태는 최소화) | 로그인 상태 정도만 전역으로 필요, 과한 상태관리 라이브러리는 지양 |
| 폼 처리 | React Hook Form (선택) | 회원가입/글쓰기 등 폼 검증 |
| 배포 | Netlify | 정적 사이트 무료 호스팅, 커스텀 도메인 연결 용이 |

Codex는 위 스택을 기준으로 `npm create vite@latest . -- --template react-ts` 로 프로젝트를 초기화한 뒤 진행합니다.

---

## 3. 폴더 구조

```
seowonfc-frontend/
 ├─ public/
 ├─ src/
 │   ├─ api/                # axios 인스턴스, 도메인별 API 함수
 │   │   ├─ client.ts        # baseURL, 인터셉터 설정
 │   │   ├─ auth.ts
 │   │   ├─ news.ts
 │   │   ├─ players.ts
 │   │   ├─ matches.ts
 │   │   ├─ community.ts
 │   │   ├─ sponsors.ts
 │   │   ├─ events.ts
 │   │   └─ notifications.ts
 │   ├─ components/          # 재사용 컴포넌트 (Header, Footer, Card, Button 등)
 │   ├─ pages/                # 라우트 단위 페이지
 │   ├─ contexts/             # AuthContext 등 전역 상태
 │   ├─ types/                # API 응답 타입 정의 (백엔드 DTO와 1:1 매칭)
 │   ├─ hooks/                # useAuth, usePagination 등 커스텀 훅
 │   ├─ App.tsx
 │   └─ main.tsx
 ├─ .env.example
 ├─ netlify.toml
 ├─ tailwind.config.js
 └─ README.md
```

---

## 4. 환경변수

`.env.example` 파일을 만들고, 로컬 개발 시 `.env.local`로 복사해서 사용합니다.

```
VITE_API_BASE_URL=https://seowonfc-api.onrender.com/api/v1
```

로컬에서 백엔드를 직접 띄워 테스트할 경우 `.env.local`에서 `http://localhost:8080/api/v1`로 덮어써서 사용합니다.

`src/api/client.ts`에서 아래처럼 baseURL을 읽어옵니다.

```ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
```

---

## 5. 페이지 구성 및 우선순위

Codex는 아래 순서대로 페이지를 구현합니다. (백엔드 API 명세서의 회원용/관리자용 분리를 그대로 프론트에도 반영합니다.)

### 5-1. 공통 레이아웃 (최우선)
- `Header` — 로고, 네비게이션 메뉴(뉴스/선수단/경기정보/커뮤니티/스폰서/이벤트), 로그인 상태에 따라 로그인/로그아웃 버튼 전환, **모바일에서는 햄버거 메뉴로 전환**
- `Footer` — 구단 정보, 저작권 표기
- `Layout` — Header + Outlet(페이지 콘텐츠) + Footer 공통 래퍼

### 5-2. 인증
- 로그인 페이지 (`/login`) — 이메일/비밀번호 입력 → `POST /auth/login` → 토큰을 `localStorage`에 저장, `AuthContext`에 로그인 상태 반영
- 회원가입 페이지 (`/signup`) — `POST /auth/signup`
- `AuthContext` — 로그인 여부, 사용자 정보(이름, role) 전역 관리. role이 `ADMIN`인지 여부로 관리자 메뉴 노출 결정

### 5-3. 구단 뉴스
- 뉴스 목록 (`/news`) — 카드형 그리드, 페이지네이션. 데스크톱 3열 / 태블릿 2열 / 모바일 1열
- 뉴스 상세 (`/news/:id`)

### 5-4. 선수단
- 선수단 명단 (`/players`) — 포지션별 필터, 카드 그리드
- 선수 상세 (`/players/:id`)

### 5-5. 경기 정보
- 경기 일정/결과 (`/matches`) — 시즌/상태 필터
- 리그 순위표 (`/standings`) — 테이블, 모바일에서는 가로 스크롤 처리

### 5-6. 팬 커뮤니티
- 게시판 목록 (`/boards/:boardType`) — free/cheering 탭 전환
- 게시글 상세 (`/boards/:boardType/:postId`) — 댓글 목록/작성 포함
- 게시글 작성/수정 (`/boards/:boardType/write`) — 로그인 필요, 비로그인 접근 시 로그인 페이지로 리다이렉트

### 5-7. 스폰서
- 스폰서 목록 (`/sponsors`) — 로고 그리드, tier별 구분(OFFICIAL 상단, PARTNER 하단)

### 5-8. 이벤트
- 이벤트 목록/상세 (`/events`, `/events/:id`) — 응모 버튼(로그인 필요), 당첨자 목록

### 5-9. 마이페이지
- 내 정보 (`/mypage`) — 정보 수정, 내 알림 목록

### 5-10. 관리자 페이지 (마지막 우선순위)
- `/admin` 하위에 뉴스/선수/경기/스폰서/이벤트 CRUD 폼
- role이 `ADMIN`이 아니면 접근 시 홈으로 리다이렉트
- 우선순위가 가장 낮으므로, 일반 회원용 페이지가 전부 끝난 뒤 마지막에 구현

---

## 6. API 연동 참고

백엔드 API 명세서(`서원FC_API_명세서.md`)를 기준으로 연동합니다. 핵심 규칙:

- 모든 응답은 아래 공통 포맷을 감싸고 있으므로, `data` 필드만 꺼내 쓰는 공통 유틸을 만들어 사용합니다.
  ```json
  { "success": true, "code": 200, "data": { ... }, "message": "OK" }
  ```
- 회원용 API: `/api/v1/...`
- 관리자용 API: `/api/v1/admin/...` (Authorization 헤더에 ADMIN 토큰 필요)
- 목록 조회는 `page`, `size` 쿼리 파라미터 사용 (기본 `page=0`, `size=20`)
- 인증이 필요한 요청인데 토큰이 없거나 만료된 경우, `401` 응답을 받으면 로그인 페이지로 리다이렉트하는 axios 인터셉터를 만들어둡니다.

---

## 7. 디자인 시스템 — 블랙 & 화이트 미니멀

전체 톤은 **흑백 기반의 미니멀 디자인**으로 통일합니다. 화려한 그라데이션이나 다채로운 색상을 지양하고, 여백과 타이포그래피 위계로 정돈된 느낌을 냅니다.

### 7-1. 컬러 팔레트

Tailwind `tailwind.config.js`에 아래 색상을 커스텀 토큰으로 등록해서 전체 프로젝트에서 일관되게 사용합니다.

| 용도 | 색상명 | HEX | 사용처 |
|---|---|---|---|
| 기본 배경 | `background` | `#FFFFFF` | 페이지 전체 배경 |
| 대비 배경(섹션 구분) | `surface` | `#F7F7F7` | 카드 배경, 섹션 배경 교차 |
| 기본 텍스트 | `ink` | `#111111` | 제목, 본문 |
| 보조 텍스트 | `muted` | `#6B6B6B` | 설명문, 메타 정보(날짜, 조회수 등) |
| 테두리/구분선 | `line` | `#E5E5E5` | 카드 테두리, 구분선 |
| 강조(포인트) | `accent` | `#000000` | 버튼, 링크 hover, 활성 탭 표시 — 별도 색 없이 검정 자체를 포인트로 사용 |
| 위험/에러 | `danger` | `#D0342C` | 폼 에러 메시지 등 최소한으로만 사용 |

```js
// tailwind.config.js 예시
theme: {
  extend: {
    colors: {
      background: '#FFFFFF',
      surface: '#F7F7F7',
      ink: '#111111',
      muted: '#6B6B6B',
      line: '#E5E5E5',
      accent: '#000000',
      danger: '#D0342C',
    },
  },
},
```

### 7-2. 타이포그래피

- 폰트: 시스템 기본 산세리프(`font-sans`) 또는 Pretendard 같은 깔끔한 한글 웹폰트 사용
- 위계는 크기와 굵기로만 구분하고, 색상 대비는 최소화 (제목도 컬러 포인트 없이 `ink` 톤 유지)

| 요소 | 크기(모바일 → 데스크톱) | 굵기 |
|---|---|---|
| 페이지 타이틀(h1) | `text-2xl` → `text-4xl` | `font-bold` |
| 섹션 제목(h2) | `text-xl` → `text-2xl` | `font-semibold` |
| 카드 제목(h3) | `text-base` → `text-lg` | `font-medium` |
| 본문 | `text-sm` → `text-base` | `font-normal` |
| 메타 정보(날짜 등) | `text-xs` → `text-sm` | `font-normal`, `text-muted` |

### 7-3. 여백/레이아웃 원칙

- 콘텐츠 최대 폭: `max-w-6xl mx-auto` (넓은 화면에서도 콘텐츠가 너무 퍼지지 않도록)
- 섹션 간 여백: `py-16` ~ `py-24` (데스크톱 기준), 모바일은 `py-8` ~ `py-12`로 축소
- 카드 내부 padding: `p-5` ~ `p-6`
- 카드 사이 gap: `gap-6`
- **그림자(box-shadow)는 최소화하고, 대신 `border border-line`으로 카드 경계를 표현** — 미니멀 톤 유지의 핵심 규칙

### 7-4. 컴포넌트 스타일 가이드

- **버튼**: 배경 검정(`bg-ink`) + 흰 텍스트가 기본(Primary), 테두리만 있는 흰 배경 버튼이 보조(Secondary). 모서리는 `rounded-md` 정도로 과하지 않게. hover 시 약간의 투명도 변화(`hover:opacity-80`)만 적용
- **카드**: 흰 배경 + `border border-line` + `rounded-lg`, 그림자 없음. hover 시에도 미묘한 `border-ink` 전환 정도만
- **네비게이션**: 흰 배경 고정 헤더, 하단에 얇은 `border-b border-line`. 현재 페이지는 색상이 아니라 **밑줄 또는 굵기**로 표시
- **이미지**: 뉴스/선수 썸네일은 `object-cover`로 비율 고정, 모서리는 카드와 통일된 `rounded-lg`
- **폼 입력창**: 배경 흰색, `border border-line`, focus 시 `border-ink`로 전환 (색상 강조 없이 굵기/톤 변화로만 상태 표현)
- **아이콘**: 사용한다면 outline 스타일(lucide-react 등)로 통일, 채워진 컬러 아이콘 지양

### 7-5. 하지 말아야 할 것 (Codex 체크리스트)

- ❌ 그라데이션 배경
- ❌ 파스텔톤이나 원색 포인트 컬러 추가
- ❌ 과도한 그림자(`shadow-xl` 등)나 네온 느낌의 효과
- ❌ 둥글기가 과한 버튼/카드(`rounded-full` 버튼 등은 지양, 필요한 곳은 배지/태그 정도만)
- ✅ 여백을 충분히 주고, 흑백 대비와 타이포 크기만으로 위계를 표현

---

## 8. 반응형 디자인 기준

Tailwind 기본 breakpoint를 그대로 사용합니다.

| Breakpoint | 폭 | 대상 |
|---|---|---|
| 기본(모바일) | ~639px | 1열 레이아웃, 햄버거 메뉴 |
| `sm` | 640px~ | 모바일 큰 화면 |
| `md` | 768px~ | 태블릿, 2열 그리드 |
| `lg` | 1024px~ | 데스크톱, 3열 그리드, 풀 네비게이션 메뉴 |
| `xl` | 1280px~ | 넓은 데스크톱, 콘텐츠 최대 폭 제한(예: `max-w-7xl mx-auto`) |

모든 페이지는 모바일 우선(mobile-first)으로 작성하고, 이미지/카드/테이블 요소는 작은 화면에서 잘리거나 가로 스크롤이 깨지지 않도록 처리합니다.

---

## 9. 배포 — Netlify

### 8-1. netlify.toml (프로젝트 루트)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

SPA이므로 새로고침 시 404가 나지 않도록 redirects 설정이 필수입니다.

### 8-2. Netlify 대시보드 설정
1. GitHub 저장소(`ohofront/seowonfc-frontend`) 연결
2. Build command: `npm run build`, Publish directory: `dist`
3. Environment variables에 `VITE_API_BASE_URL` 값을 운영 API 주소로 등록
4. 배포 후 Domain settings에서 커스텀 도메인 `www.seowonfc.com` 연결 (구매한 도메인 등록업체에서 Netlify가 안내하는 DNS 레코드로 CNAME/A 설정)

---

## 10. Codex 작업 순서 (요약)

1. Vite + React + TS 프로젝트 초기화, Tailwind 설정 + 7장의 디자인 토큰(색상) 등록
2. 공통 레이아웃(Header/Footer/Layout) + 라우팅 뼈대 구성 — 이 단계에서부터 블랙&화이트 미니멀 톤 적용
3. `api/client.ts` 등 axios 공통 설정
4. 인증(로그인/회원가입, AuthContext) 구현
5. 뉴스 → 선수단 → 경기정보 → 커뮤니티 → 스폰서 → 이벤트 → 마이페이지 순서로 구현 (백엔드 개발 순서와 동일하게 맞춤)
6. 반응형 스타일 전체 점검
7. 디자인 시스템 체크리스트(7-5) 기준으로 전체 페이지 재검토
8. 관리자 페이지 구현
9. `netlify.toml` 작성, 빌드 테스트
10. README.md 최신화

각 단계가 끝날 때마다 `npm run build`가 에러 없이 통과하는지 확인하고 커밋합니다.
