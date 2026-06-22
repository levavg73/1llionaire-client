import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://voit-client.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
