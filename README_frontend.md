# 서원 FC 홈페이지 (프론트엔드)

서원 FC 동호회 공식 홈페이지 프론트엔드 프로젝트입니다.

- 배포 주소: https://www.seowonfc.com
- 백엔드 API: [seowonfc-api](https://github.com/ohobackend/seowonfc-api) ([API 서버](https://seowonfc-api.onrender.com), [Swagger 문서](https://seowonfc-api.onrender.com/swagger-ui/index.html))

## 기술 스택

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Axios

## 폴더 구조

```
src/
 ├─ api/          # 백엔드 API 연동 함수
 ├─ components/   # 공통 컴포넌트
 ├─ pages/        # 라우트 단위 페이지
 ├─ contexts/     # 전역 상태(로그인 등)
 ├─ types/        # API 응답 타입
 └─ hooks/        # 커스텀 훅
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

- 구단 뉴스 조회
- 선수단 명단/프로필 조회
- 경기 일정/결과, 리그 순위표 조회
- 팬 커뮤니티 (게시글/댓글, 자유게시판/응원게시판)
- 스폰서 소개
- 이벤트 응모
- 회원가입/로그인, 마이페이지
- 관리자 페이지 (뉴스/선수/경기/스폰서/이벤트 관리)
