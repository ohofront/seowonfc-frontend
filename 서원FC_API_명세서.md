# 서원 FC 홈페이지 API 설계 및 명세서

> 참고: FC서울(fcseoul.com) 공식 홈페이지의 주요 메뉴 구성(구단 소식, 경기일정/결과, 선수단, 티켓/멤버십, 팬 커뮤니티, 스폰서, 쇼핑몰 등)을 벤치마킹하여 "서원 FC" 구단 홈페이지에 필요한 REST API를 설계함.

---

## 1. 개요

### 1.1 목적
서원 FC(동호회) 홈페이지 운영에 필요한 백엔드 API를 정의한다. 프론트엔드(웹/모바일)는 본 API를 통해 구단 소식, 경기 일정/결과, 선수단 정보, 팬 커뮤니티, 스폰서, 이벤트, 알림 등의 기능을 제공한다.

> ※ 참가 신청(예매)·멤버십·쇼핑몰(굿즈) 기능은 이번 버전 범위에서 제외한다. 추후 필요 시 별도 스펙으로 추가한다.

### 1.2 기술 스펙 (제안)
| 항목 | 내용 |
|---|---|
| 프로토콜 | HTTPS |
| 스타일 | REST |
| 데이터 포맷 | JSON |
| 인증 | JWT (Access Token + Refresh Token) |
| Base URL | `https://api.seowonfc.com/v1` |
| 문서 규격 | OpenAPI 3.0 준수 가능 |

### 1.3 공통 응답 포맷
```json
{
  "success": true,
  "code": 200,
  "message": "OK",
  "data": { },
  "meta": { "page": 1, "size": 20, "totalElements": 134, "totalPages": 7 }
}
```

에러 응답:
```json
{
  "success": false,
  "code": 40001,
  "message": "요청 값이 유효하지 않습니다.",
  "errors": [
    { "field": "email", "reason": "이메일 형식이 아닙니다." }
  ]
}
```

### 1.4 공통 에러 코드
| HTTP Status | code | 설명 |
|---|---|---|
| 400 | 40001 | 잘못된 요청(유효성 검증 실패) |
| 401 | 40100 | 인증 필요(토큰 없음/만료) |
| 403 | 40300 | 권한 없음 |
| 404 | 40400 | 리소스 없음 |
| 409 | 40900 | 중복/충돌 (예: 중복 등록) |
| 429 | 42900 | 요청 과다 |
| 500 | 50000 | 서버 내부 오류 |

---

## 2. 기능 목록 (FC서울 벤치마킹 기반)

| 대분류 | 기능 |
|---|---|
| 회원 | 회원가입, 로그인/로그아웃, 소셜로그인, 회원정보 수정, 탈퇴, 비밀번호 재설정 |
| 구단뉴스 | 뉴스/보도자료 목록·상세, 포토/영상 갤러리 |
| 팀·선수단 | 선수단 명단, 선수 상세 프로필(등번호, 포지션, 기록), 코칭스태프 |
| 경기 정보 | 시즌 일정, 경기 결과, 라이브 스코어, 리그 순위표, 헤드투헤드 기록 |
| 팬 커뮤니티 | 게시판(자유/응원), 댓글, 좋아요, 신고 |
| 스폰서 | 스폰서/파트너사 목록 노출 |
| 이벤트 | 이벤트 목록, 응모, 당첨자 조회 |
| 알림 | 공지/푸시 알림 발송·조회 |
| 관리자(CMS) | 뉴스/경기/선수/이벤트 등록·수정·삭제 권한 관리 |

---

## 3. 도메인 모델 (핵심 엔티티)

- **User**(회원) — id, name, email, phone, birth, gender, role, createdAt
- **Player**(선수) — id, name, backNumber, position, nationality, birth, height, weight, profileImageUrl, stats
- **Match**(경기) — id, season, round, competition(리그/컵), homeTeam, awayTeam, matchDate, stadium, status(예정/진행중/종료), homeScore, awayScore
- **Standing**(순위) — team, rank, played, win, draw, lose, points, goalDiff
- **News**(뉴스) — id, title, content, category, thumbnailUrl, publishedAt, viewCount
- **Post / Comment**(게시글/댓글) — id, boardType, userId, title, content, likeCount, createdAt
- **Sponsor**(스폰서) — id, name, logoUrl, tier(공식/후원사), linkUrl
- **Event**(이벤트) — id, title, content, startDate, endDate, winners

---

## 4. API 엔드포인트 명세

URL 네임스페이스로 회원용과 관리자용을 구분한다.
- 회원용(공개/일반회원): `/api/v1/...`
- 관리자용(CMS): `/api/v1/admin/...`

---

## 4-A. 회원용 API (일반 사용자 / 비로그인 포함)

### 4-A.1 인증/회원 (Auth & User)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | 회원가입 | - |
| POST | `/api/v1/auth/login` | 로그인 (JWT 발급) | - |
| POST | `/api/v1/auth/logout` | 로그아웃 | O |
| POST | `/api/v1/auth/refresh` | Access Token 재발급 | Refresh Token |
| POST | `/api/v1/auth/social/{provider}` | 소셜 로그인 (kakao/naver/google) | - |
| POST | `/api/v1/auth/password/reset-request` | 비밀번호 재설정 메일 발송 | - |
| POST | `/api/v1/auth/password/reset` | 비밀번호 재설정 | - |
| GET | `/api/v1/users/me` | 내 정보 조회 | O |
| PUT | `/api/v1/users/me` | 내 정보 수정 | O |
| DELETE | `/api/v1/users/me` | 회원 탈퇴 | O |

**요청 예시 - 로그인**
```
POST /api/v1/auth/login
{
  "email": "fan@seowonfc.com",
  "password": "********"
}
```
**응답 예시**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1023, "name": "홍길동", "role": "USER" }
  }
}
```

### 4-A.2 구단 뉴스 (조회 전용)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/news` | 뉴스 목록 (쿼리: category, page, size, keyword) | - |
| GET | `/api/v1/news/{newsId}` | 뉴스 상세 | - |
| GET | `/api/v1/news/gallery` | 포토/영상 갤러리 목록 | - |

### 4-A.3 선수단 (조회 전용)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/players` | 선수단 명단 (쿼리: position, season) | - |
| GET | `/api/v1/players/{playerId}` | 선수 상세 프로필 및 시즌 기록 | - |
| GET | `/api/v1/coaches` | 코칭스태프 목록 | - |

### 4-A.4 경기 정보 (조회 전용)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/matches` | 경기 일정/결과 목록 (쿼리: season, month, status) | - |
| GET | `/api/v1/matches/{matchId}` | 경기 상세 (라인업, 기록) | - |
| GET | `/api/v1/matches/{matchId}/live` | 실시간 스코어/이벤트 (골, 카드, 교체) | - |
| GET | `/api/v1/standings` | 리그 순위표 (쿼리: season, competition) | - |
| GET | `/api/v1/matches/{matchId}/h2h` | 상대 전적 조회 | - |

### 4-A.5 팬 커뮤니티 (회원 액션 포함)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/boards/{boardType}/posts` | 게시글 목록 | - |
| GET | `/api/v1/boards/{boardType}/posts/{postId}` | 게시글 상세 | - |
| POST | `/api/v1/boards/{boardType}/posts` | 게시글 작성 | O |
| PUT | `/api/v1/boards/{boardType}/posts/{postId}` | 게시글 수정(본인 글만) | O |
| DELETE | `/api/v1/boards/{boardType}/posts/{postId}` | 게시글 삭제(본인 글만) | O |
| POST | `/api/v1/boards/{boardType}/posts/{postId}/comments` | 댓글 작성 | O |
| POST | `/api/v1/boards/{boardType}/posts/{postId}/like` | 좋아요 | O |
| POST | `/api/v1/boards/{boardType}/posts/{postId}/report` | 신고 | O |

### 4-A.6 스폰서 (조회 전용)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/sponsors` | 스폰서/파트너사 목록 (쿼리: tier) | - |

### 4-A.7 이벤트 (조회 + 응모)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/events` | 이벤트 목록 | - |
| GET | `/api/v1/events/{eventId}` | 이벤트 상세 | - |
| POST | `/api/v1/events/{eventId}/apply` | 이벤트 응모 | O |
| GET | `/api/v1/events/{eventId}/winners` | 당첨자 조회 | - |

### 4-A.8 알림 (본인 알림만)

| Method | Endpoint | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/v1/notifications/me` | 내 알림 목록 | O |
| PUT | `/api/v1/notifications/{notificationId}/read` | 알림 읽음 처리 | O |

---

## 4-B. 관리자용 API (`/api/v1/admin/**`, ADMIN 권한 전용)

일반 회원용 API와 URL 자체를 분리해, 관리자 기능은 실수로도 일반 회원이 접근할 수 없게 한다.
아래 API는 전부 `ADMIN` role 필수이며, Swagger에서도 `Admin` 그룹으로 따로 묶는다.

### 4-B.1 회원 관리

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/v1/admin/users` | 전체 회원 목록/검색 |
| GET | `/api/v1/admin/users/{userId}` | 회원 상세 |
| PUT | `/api/v1/admin/users/{userId}/role` | 회원 권한(Role) 변경 |
| DELETE | `/api/v1/admin/users/{userId}` | 회원 강제 탈퇴 |

### 4-B.2 뉴스 관리

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/news` | 뉴스 등록 |
| PUT | `/api/v1/admin/news/{newsId}` | 뉴스 수정 |
| DELETE | `/api/v1/admin/news/{newsId}` | 뉴스 삭제 |

### 4-B.3 선수단 관리

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/players` | 선수 등록 |
| PUT | `/api/v1/admin/players/{playerId}` | 선수 정보 수정 |
| DELETE | `/api/v1/admin/players/{playerId}` | 선수 삭제 |
| POST | `/api/v1/admin/coaches` | 코칭스태프 등록 |

### 4-B.4 경기 관리

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/matches` | 경기 일정 등록 |
| PUT | `/api/v1/admin/matches/{matchId}` | 경기 결과/상태 수정(스코어, 진행상태) |
| DELETE | `/api/v1/admin/matches/{matchId}` | 경기 삭제 |
| PUT | `/api/v1/admin/standings` | 순위표 갱신 |

### 4-B.5 커뮤니티 관리(모더레이션)

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/v1/admin/boards/reports` | 신고된 게시글/댓글 목록 |
| DELETE | `/api/v1/admin/boards/posts/{postId}` | 게시글 강제 삭제(타인 글 포함) |
| DELETE | `/api/v1/admin/boards/comments/{commentId}` | 댓글 강제 삭제 |

### 4-B.6 스폰서 관리

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/sponsors` | 스폰서 등록 |
| PUT | `/api/v1/admin/sponsors/{sponsorId}` | 스폰서 정보 수정 |
| DELETE | `/api/v1/admin/sponsors/{sponsorId}` | 스폰서 삭제 |

### 4-B.7 이벤트 관리

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/events` | 이벤트 등록 |
| PUT | `/api/v1/admin/events/{eventId}` | 이벤트 수정 |
| DELETE | `/api/v1/admin/events/{eventId}` | 이벤트 삭제 |
| POST | `/api/v1/admin/events/{eventId}/winners` | 당첨자 선정/등록 |

### 4-B.8 알림 발송

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/v1/admin/notifications/push` | 전체/대상 회원에게 알림 발송 |

---

## 5. 인증/인가 정책

| 역할(Role) | 설명 |
|---|---|
| `GUEST` | 비로그인 사용자 — 뉴스/경기정보/선수단 등 조회만 가능 |
| `USER` | 일반 회원 — 커뮤니티 글쓰기/댓글, 이벤트 응모 가능 |
| `ADMIN` | 관리자 — `/api/v1/admin/**` 전 기능 접근 가능 |

- 인증 방식: `Authorization: Bearer {accessToken}` 헤더 사용
- Access Token 만료: 30분 / Refresh Token 만료: 14일
- **URL 네임스페이스로 1차 분리**: `/api/v1/admin/**` 는 Security 설정에서 `ADMIN` role만 통과하도록 전면 차단
- **Method 레벨로 2차 분리**: 컨트롤러/서비스에 `@PreAuthorize("hasRole('ADMIN')")` 을 함께 걸어, 설정 누락 시에도 이중으로 방어
- 커뮤니티 글 수정/삭제처럼 "본인 데이터만" 허용해야 하는 경우는 Role 체크가 아니라 Service 단에서 `post.getAuthor().getId().equals(userId)` 검증으로 처리

---

## 6. 페이징/정렬/검색 공통 규칙

- 목록 조회 API는 공통 쿼리 파라미터 지원: `page`(기본 0), `size`(기본 20), `sort`(예: `createdAt,desc`)
- 검색: `keyword` 파라미터로 제목/내용 검색 지원
- 예: `GET /news?category=CLUB&page=0&size=10&sort=publishedAt,desc`

---

## 7. 향후 확장 고려 사항
- 실시간 경기 스코어는 WebSocket(`wss://api.seowonfc.com/v1/matches/{matchId}/live`) 채널 별도 고려
- 참가 신청(예매)·멤버십·쇼핑몰 기능은 추후 별도 스펙으로 확장 가능 (필요 시 결제 연동도 함께 검토)
- 선수 통계는 시즌별 이력 관리를 위해 `PlayerSeasonStat` 서브 엔티티로 분리 권장
- 관리자 CMS는 별도 `/admin/*` 네임스페이스 및 감사로그(Audit Log) 적용 권장

---

*본 문서는 FC서울 공식 홈페이지의 공개된 메뉴 구성을 참고하여 서원 FC 서비스에 맞게 재설계한 API 명세서입니다.*
