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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      const categories = await Category.find().lean();
      const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();

      if (products && products.length > 0) {
        return {
          products: JSON.parse(JSON.stringify(products)),
          categories: JSON.parse(JSON.stringify(categories)),
          banners: JSON.parse(JSON.stringify(banners)),
        };
      }
    }
  } catch (e) {
    console.error('Database query in page.tsx:', e);
  }

  // Fallback to memory store or seedData
  return {
    products: memoryStore?.products || initialProducts,
    categories: memoryStore?.categories || initialCategories,
    banners: memoryStore?.banners || initialBanners,
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
