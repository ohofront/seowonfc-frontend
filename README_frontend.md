# 서원 FC 홈페이지 (프론트엔드)

서원 FC 동호회 공식 홈페이지 프론트엔드 프로젝트입니다.

- 배포 주소: https://www.seowonfc.com
- 백엔드 API: [seowonfc-api](https://github.com/ohobackend/seowonfc-api) ([API 서버](https://seowonfc-api.onrender.com), [Swagger 문서](https://seowonfc-api.onrender.com/swagger-ui/index.html))

## 기술 스택

- React + Vite + TypeScript
- Tailwind CSS
- React Router v6
- Axios, React Hook Form
- i18n (경량 자체 Context 기반 다국어 시스템)

## 폴더 구조

```text
src/
 ├─ api/          # 백엔드 API 연동 함수
 ├─ components/   # 공통 컴포넌트, 축구공 스피너, 레이아웃
 ├─ contexts/     # 전역 상태(로그인 등)
 ├─ hooks/        # 커스텀 훅
 ├─ i18n/         # 다국어 번역 사전(ko, en, fr, de) 및 useTranslation
 ├─ pages/        # 라우트 단위 페이지
 ├─ types/        # API 응답 타입
 └─ utils/        # 공통 유틸리티
```

자세한 개발 지침은 [`CODEX_개발_지시서.md`](./CODEX_개발_지시서.md)를 참고하세요.

## 로컬 개발 환경 설정

### 1. 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 API 주소를 지정합니다.

```bash
cp .env.example .env.local
```

```
VITE_API_BASE_URL=https://seowonfc-api.onrender.com/api/v1
```

로컬에서 백엔드를 직접 띄워 테스트하려면 `http://localhost:8080/api/v1`로 변경합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

## 배포

이 프로젝트는 [Netlify](https://www.netlify.com)를 통해 배포됩니다.

- `main` 브랜치에 push하면 자동으로 빌드 및 배포됩니다.
- 빌드 명령어: `npm run build`
- 배포 디렉토리: `dist`
- 커스텀 도메인: `www.seowonfc.com`

## 주요 기능

- **다국어(i18n) 지원**:
  - 한국어(기본), 영어(English), 프랑스어(Français), 독일어(Deutsch) 4개 국어 지원
  - 상단 헤더의 언어 드롭다운(🌐)을 통해 실시간 언어 전환
  - `localStorage` 기반 선택 언어 유지 및 브라우저 언어 자동 감지
  - 메뉴, 홈 히어로, 경기정보, 선수단, 뉴스, 인증 등 주요 UI 및 날짜 로케일 다국어화
- **축구공 로딩 인디케이터 (`SoccerSpinner`)**:
  - 귀여운 클래식 축구공 SVG 컴포넌트(`SoccerBallIcon`) 기반
  - 위아래로 경쾌하게 통통 튀는 바운스 및 회전 애니메이션과 바닥 그림자 효과
  - 전역 API 요청 백드롭 및 각 페이지 데이터 로딩 상태에 일관되게 적용
- **구단 뉴스 조회**: 목록, 카테고리 필터, 상세 조회
- **선수단 명단/프로필 조회**: 포지션별 필터, 상세 프로필 및 시즌 기록, 선수 등록 신청 기능
- **경기 일정/결과, 리그 순위표 조회**: 시즌 및 진행 상태(예정/진행 중/종료/취소) 필터
- **팬 커뮤니티**: 자유게시판/응원게시판 게시글 및 댓글 작성
- **스폰서 소개 및 신청**: 공식 스폰서/파트너 목록 및 후원 신청
- **이벤트 응모**: 구단 이벤트 상세 및 회원 응모
- **회원가입/로그인, 마이페이지**: JWT 인증, 자동 로그인, 회원 정보 수정 및 알림 확인
- **관리자 페이지**: 뉴스/선수단/경기/스폰서/이벤트 및 선수 등록 승인 관리 (`ADMIN` 전용)
