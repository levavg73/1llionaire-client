const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

let apiHostname;

try {
  apiHostname = apiBaseUrl ? new URL(apiBaseUrl).hostname : undefined;
} catch {
  apiHostname = undefined;
}

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
];

const nextConfig = {
  poweredByHeader: false,

  // ── 이미지 최적화 ────────────────────────────────────────
  images: {
    // WebP + AVIF 순서로 최신 포맷 우선 제공
    formats: ['image/avif', 'image/webp'],
    // CDN 캐시 TTL 최대화
    minimumCacheTTL: 31536000,
    remotePatterns: [
      ...(apiHostname
        ? [
            { protocol: 'https', hostname: apiHostname },
            { protocol: 'http', hostname: apiHostname },
          ]
        : []),
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },

  // ── 실험적 최적화 ─────────────────────────────────────────
  experimental: {
    // 패키지 import 최적화 (lucide-react 트리 쉐이킹)
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // ── 압축 ─────────────────────────────────────────────────
  compress: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // 정적 에셋 장기 캐시
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // 이미지 캐시
      {
        source: '/(.*)\\.(webp|avif|png|jpg|jpeg|svg|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
