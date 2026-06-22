function normalizeApiProxyTarget(value) {
  return (value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");
}

const apiProxyTarget = normalizeApiProxyTarget(
  process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000")
);

if (process.env.NODE_ENV === "production" && !apiProxyTarget) {
  throw new Error("API_PROXY_TARGET or NEXT_PUBLIC_API_BASE_URL is required in production.");
}

let apiHostname;

try {
  apiHostname = apiProxyTarget ? new URL(apiProxyTarget).hostname : undefined;
} catch {
  apiHostname = undefined;
}

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      ...(apiHostname
        ? [
            { protocol: "https", hostname: apiHostname },
            { protocol: "http", hostname: apiHostname },
          ]
        : []),
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  compress: true,

  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*)\\.(webp|avif|png|jpg|jpeg|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
