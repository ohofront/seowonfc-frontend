# 서원 FC 프론트엔드

서원 FC 동호회 공식 홈페이지입니다. 모바일부터 데스크톱까지 대응하는 React SPA로, 블랙 & 화이트 미니멀 디자인을 적용했습니다.

## 기술 스택

- React, TypeScript, Vite
- Tailwind CSS
- React Router v6
- Axios, React Hook Form
- i18n (경량 자체 Context 기반 다국어 시스템)
- Netlify

## 실행 방법

Node.js 20 이상을 권장합니다.

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에서 API 주소를 설정할 수 있습니다.

```dotenv
VITE_API_BASE_URL=https://seowonfc-api.onrender.com/api/v1
```

로컬 백엔드를 사용한다면 `http://localhost:8080/api/v1`로 변경하세요.

## 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 타입 검사 및 프로덕션 빌드
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과 미리보기
```

## 주요 기능 및 화면

- **다국어(i18n) 지원**: 4개 국어(🇰🇷 한국어, 🇺🇸 영어, 🇫🇷 프랑스어, 🇩🇪 독일어) 지원. 헤더 상단 언어 선택기(🌐)를 통해 즉시 변경 가능하며, `localStorage`에 저장되어 언어 설정이 유지됩니다.
- **축구공 로딩 애니메이션 (`SoccerSpinner`)**: 구단 아이덴티티를 살린 통통 튀는 축구공 바운스 및 회전 로딩 인디케이터가 전역 API 요청 및 페이지 데이터 로딩 화면에 적용되어 있습니다.
- **인증**: 로그인, 회원가입, JWT 로그인 상태 관리, 자동 로그인 유지
- **뉴스**: 목록, 페이지네이션, 카테고리별 분류, 상세 조회
- **선수단**: 포지션 필터, 선수 프로필 및 상세 시즌 통계, 선수 등록 신청 및 내 신청 내역 조회
- **경기**: 시즌/상태 필터, 경기 일정 및 결과, 리그 순위표
- **커뮤니티**: 자유/응원 게시판, 게시글 작성/조회/삭제, 댓글 기능
- **스폰서**: OFFICIAL/PARTNER 등급별 파트너 소개 및 스폰서 신청
- **이벤트**: 목록, 상세, 회원 응모, 당첨자 발표
- **마이페이지**: 회원 정보 수정, 알림 목록
- **관리자**: 뉴스/선수/경기/스폰서/이벤트 및 신청 관리 (`ADMIN` 전용)

## 프로젝트 구조

```text
src/
├── api/          # Axios 클라이언트와 도메인 API
├── components/   # 레이아웃, 공통 UI, 축구공 스피너, 보호 라우트
├── contexts/     # 인증 전역 상태
├── hooks/        # 인증 및 비동기 데이터 훅
├── i18n/         # 다국어 설정, 번역 사전(ko, en, fr, de) 및 LanguageContext
├── pages/        # 라우트 페이지
├── types/        # API DTO 타입
├── utils/        # 날짜 포맷, 스토리지 유틸
├── App.tsx
└── main.tsx
```

API 응답은 `{ success, code, data, message }` 포맷과 비래핑 응답을 모두 처리합니다. `401` 응답 시 토큰을 정리하고 로그인 페이지로 이동합니다.

## 배포

Netlify 설정은 [netlify.toml](./netlify.toml)에 포함되어 있습니다. 빌드 명령은 `npm run build`, 배포 디렉터리는 `dist`이며 SPA fallback redirect가 설정되어 있습니다.
