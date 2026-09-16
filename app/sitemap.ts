import type { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { fetchBusinessKoroProducts } from "@/lib/businessKoro";

const SITE_URL = "https://havitall.shop";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/track-order`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const slugs = new Set<string>();
  const categorySlugs = new Set<string>();

  try {
    const db = await connectToDatabase();
    if (db) {
      const [dbProducts, dbCategories] = await Promise.all([
        Product.find({ isDeleted: { $ne: true } }).select("slug updatedAt").lean(),
        Category.find({}).select("slug").lean(),
      ]);

      for (const p of dbProducts) {
        if (p.slug) slugs.add(String(p.slug).toLowerCase());
      }
      for (const c of dbCategories) {
        if (c.slug) categorySlugs.add(String(c.slug).toLowerCase());
      }
    }

    const bkProducts = await fetchBusinessKoroProducts();
    if (Array.isArray(bkProducts)) {
      for (const p of bkProducts) {
        if (p.slug) slugs.add(String(p.slug).toLowerCase());
      }
    }
  } catch {
    // If the catalog can't be reached, still return the static routes below.
  }

  const productRoutes: MetadataRoute.Sitemap = Array.from(slugs).map((slug) => ({
    url: `${SITE_URL}/product/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(categorySlugs).map((slug) => ({
    url: `${SITE_URL}/shop?category=${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
