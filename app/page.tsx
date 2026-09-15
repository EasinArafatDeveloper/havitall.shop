import React from 'react';
import HeroSlider from '@/components/hero/HeroSlider';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import HotProductsSection from '@/components/home/HotProductsSection';
import DealOfTheDay from '@/components/home/DealOfTheDay';
import { memoryStore } from '@/lib/memoryStore';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Offer from '@/lib/models/Offer';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const productMap = new Map<string, any>();
  const deletedSet = new Set<string>(memoryStore?.deletedProductIds || []);
  let categories: any[] = [];
  let banners: any[] = [];
  let offers: any[] = [];

  // 1. Fetch deleted identifiers from MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const deletedRecords = await DeletedProduct.find().lean();
      if (deletedRecords && deletedRecords.length > 0) {
        deletedRecords.forEach((d: any) => {
          if (d.identifier) deletedSet.add(d.identifier);
        });
      }
    }
  } catch (e) {
    console.warn('DeletedProduct check in page.tsx:', e);
  }

  // 2. Fetch live products from Business Koro
  const bkProducts = await fetchBusinessKoroProducts();
  if (bkProducts && bkProducts.length > 0) {
    for (const p of bkProducts) {
      if (
        deletedSet.has(String(p._id)) ||
        deletedSet.has(String(p.slug)) ||
        deletedSet.has(String(p.businessKoroId))
      ) {
        continue;
      }
      productMap.set(p.slug || p._id || p.businessKoroId, p);
    }
  }

  // 3. Fetch local products, banners, categories, and offers from MongoDB
  try {
    const db = await connectToDatabase();
    if (db) {
      const localProducts = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
      const localCategories = await Category.find().lean();
      const localBanners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
      const localOffers = await Offer.find({ isActive: true }).sort({ order: 1, updatedAt: -1 }).limit(2).lean();

      if (localProducts && localProducts.length > 0) {
        for (const p of JSON.parse(JSON.stringify(localProducts))) {
          if (
            deletedSet.has(String(p._id)) ||
            deletedSet.has(String(p.slug)) ||
            deletedSet.has(String(p.businessKoroId))
          ) {
            continue;
          }
          const key = p.slug || p._id || p.businessKoroId;
          if (productMap.has(key)) {
            productMap.set(key, { ...productMap.get(key), ...p });
          } else {
            productMap.set(key, p);
          }
        }
      }
      if (localCategories) {
        categories = JSON.parse(JSON.stringify(localCategories));
      }
      if (localBanners) {
        banners = JSON.parse(JSON.stringify(localBanners));
      }
      if (localOffers) {
        offers = JSON.parse(JSON.stringify(localOffers));
      }
    }
  } catch (e) {
    console.error('Database query in page.tsx:', e);
  }

  // 4. Fallback to memory store if local DB not available
  if (productMap.size === 0 && memoryStore?.products) {
    for (const p of memoryStore.products) {
      if (
        !deletedSet.has(String(p._id)) &&
        !deletedSet.has(String(p.slug)) &&
        !deletedSet.has(String(p.businessKoroId))
      ) {
        productMap.set(p.slug || p._id || p.businessKoroId, p);
      }
    }
  }
  if (categories.length === 0 && memoryStore?.categories) {
    categories = memoryStore.categories;
  }
  if (banners.length === 0 && memoryStore?.banners) {
    banners = memoryStore.banners.filter((b: any) => b.isActive);
  }
  if (offers.length === 0 && memoryStore?.offers) {
    offers = memoryStore.offers.filter((o: any) => o.isActive).slice(0, 2);
  }

  const products = Array.from(productMap.values());

  return {
    products,
    categories,
    banners,
    offers,
  };
}

export default async function HomePage() {
  const { products, categories, banners, offers } = await getData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Swipeable Hero Slider */}
      <HeroSlider initialBanners={banners} />

      {/* Featured Collections (Curated Real Products Selected by Admin) */}
      <FeaturedCollections products={products} />

      {/* Hot & Trending Products */}
      <HotProductsSection products={products} />

      {/* Limited Countdown Deal of the Day (Max 2 Active Offers) */}
      <DealOfTheDay initialOffers={offers} />
    </div>
  );
}
