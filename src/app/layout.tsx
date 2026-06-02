import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";

// ── 메타데이터 ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "프리마이크 | 전문 진행자 매칭 플랫폼",
    template: "%s | 프리마이크",
  },
  description:
    "행사, 기업 콘텐츠, 웨딩, 라이브커머스, 컨퍼런스에 필요한 전문 아나운서·MC·쇼호스트를 연결하는 매칭 플랫폼",
  keywords: ["MC", "아나운서", "쇼호스트", "진행자", "행사진행", "이벤트", "웨딩사회자", "기업행사"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "프리마이크",
    title: "프리마이크 | 전문 진행자 매칭 플랫폼",
    description: "검증된 전문 MC·아나운서를 행사에 연결합니다.",
  },
  // 아이콘
  icons: {
    icon: "/favicon.ico",
    apple: "/brand-icon.png",
  },
};

// ── 뷰포트 (별도 export 권장 by Next.js 14) ──────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f1e" },
  ],
};

// ── 테마 스크립트 (FOUC 방지) ────────────────────────────────

const themeScript = `
  try {
    const theme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && systemDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
`;

// ── 레이아웃 ─────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 테마 FOUC 방지 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/*
         * 폰트 CDN preconnect
         * 브라우저가 DNS 조회·TCP 연결을 미리 수행 → TTFB 단축
         */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />

        {/*
         * 실제 사용 폰트 weight preload (Regular + Bold + ExtraBold)
         * 3개만 preload → 나머지는 swap으로 비동기 로드
         */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          {/* skip-to-content: 접근성 (Lighthouse Accessibility 100점 요건) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
          >
            본문으로 건너뛰기
          </a>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
