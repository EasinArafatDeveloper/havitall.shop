import React from 'react';
import HeroSlider from '@/components/hero/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid';
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
  let products: any[] = [];
  let categories: any[] = [];
  let banners: any[] = [];

  // 1. Fetch live products from Business Koro
  const bkProducts = await fetchBusinessKoroProducts();
  if (bkProducts && bkProducts.length > 0) {
    products.push(...bkProducts);
  }

  // 2. Fetch local products and banners from MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const localProducts = await Product.find().sort({ createdAt: -1 }).lean();
      const localCategories = await Category.find().lean();
      const localBanners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();

      if (localProducts && localProducts.length > 0) {
        products.push(...JSON.parse(JSON.stringify(localProducts)));
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

  // Fallback to memory store or seedData if empty
  if (products.length === 0) {
    products = memoryStore?.products || initialProducts;
  }
  if (categories.length === 0) {
    categories = memoryStore?.categories || initialCategories;
  }
  if (banners.length === 0) {
    banners = memoryStore?.banners || initialBanners;
  }

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

      {/* Categories Department Showcase */}
      <CategoryGrid categories={categories} />

      {/* Hot & Trending Products */}
      <HotProductsSection products={products} />

      {/* Limited Countdown Deal of the Day */}
      <DealOfTheDay />
    </div>
  );
}
