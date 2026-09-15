import React from 'react';
import HeroSlider from '@/components/hero/HeroSlider';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import HotProductsSection from '@/components/home/HotProductsSection';
import DealOfTheDay from '@/components/home/DealOfTheDay';
import { initialProducts, initialCategories, initialBanners } from '@/lib/seedData';
import { memoryStore } from '@/lib/memoryStore';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const productMap = new Map<string, any>();
  let categories: any[] = [];
  let banners: any[] = [];

  // 1. Fetch live products from Business Koro
  const bkProducts = await fetchBusinessKoroProducts();
  if (bkProducts && bkProducts.length > 0) {
    for (const p of bkProducts) {
      productMap.set(p.slug || p._id || p.businessKoroId, p);
    }
  }

  // 2. Fetch local products and banners from MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const localProducts = await Product.find().sort({ createdAt: -1 }).lean();
      const localCategories = await Category.find().lean();
      const localBanners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();

      if (localProducts && localProducts.length > 0) {
        for (const p of JSON.parse(JSON.stringify(localProducts))) {
          const key = p.slug || p._id || p.businessKoroId;
          if (productMap.has(key)) {
            productMap.set(key, { ...productMap.get(key), ...p });
          } else {
            productMap.set(key, p);
          }
        }
      }
      if (localCategories && localCategories.length > 0) {
        categories = JSON.parse(JSON.stringify(localCategories));
      }
      if (localBanners && localBanners.length > 0) {
        banners = JSON.parse(JSON.stringify(localBanners));
      }
    }
  } catch (e) {
    console.error('Database query in page.tsx:', e);
  }

  // 3. Fallback to memory store if map is empty
  if (productMap.size === 0 && memoryStore?.products) {
    for (const p of memoryStore.products) {
      productMap.set(p.slug || p._id || p.businessKoroId, p);
    }
  }
  if (categories.length === 0) {
    categories = memoryStore?.categories || initialCategories;
  }
  if (banners.length === 0) {
    banners = memoryStore?.banners || initialBanners;
  }

  const products = Array.from(productMap.values());

  return {
    products,
    categories,
    banners,
  };
}

export default async function HomePage() {
  const { products, categories, banners } = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Swipeable Hero Slider */}
      <HeroSlider initialBanners={banners} />

      {/* Featured Collections (Curated Real Products Selected by Admin) */}
      <FeaturedCollections products={products} />

      {/* Hot & Trending Products */}
      <HotProductsSection products={products} />

      {/* Limited Countdown Deal of the Day */}
      <DealOfTheDay />
    </div>
  );
}

