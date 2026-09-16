import type { MetadataRoute } from "next";

const SITE_URL = "https://havitall.shop";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/checkout", "/order-success/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
