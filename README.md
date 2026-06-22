# Voit Client

Voit(보잇)은 아나운서, MC, 쇼호스트, 웨딩 사회자, 콘텐츠 진행자 등 프리랜서 진행자를 행사 조건에 맞게 연결하는 전문 매칭 플랫폼입니다.

이 클라이언트는 고객 요청서 작성, 진행자 탐색, 후보 추천 확인, 상담·예약, 후기 작성, 관리자 검수 화면을 제공하는 Next.js 프론트엔드입니다.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- pnpm

## Core Features

- 고객 요청서 작성: 행사 종류, 일정, 지역, 예산, 희망 진행자 유형, 진행 분위기, 언어, 대본/리허설/출장 조건 입력
- 진행자 프로필 관리: 가능 분야, 진행 스타일, 가능 지역, 단가, 언어, 프로필 이미지 등록
- 포트폴리오 관리: 영상·음성 포트폴리오 URL 등록 및 공개 관리
- 추천 후보 확인: 관리자 검수를 거쳐 공개된 후보 비교
- 상담·예약: 추천 후보 기반 예약 신청과 채팅 상담
- 구조화 후기: 발성/전달력, 행사 이해도, 대본 이해도, 소통 등 항목별 평가
- 관리자 화면: 요청서, 후보 추천, 예약, 결제, 정산, 후기 검수 관리

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Type-check the project:

```bash
pnpm typecheck
```

Build for production:

```bash
pnpm build
```

## Environment Variables

Create `.env.local` from `.env.example` and configure the API proxy target.

```env
API_PROXY_TARGET=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

In production, keep browser API calls same-origin through `/api/*`. Do not set
`NEXT_PUBLIC_API_DIRECT_BASE_URL` unless you intentionally want to bypass the
proxy for debugging.
