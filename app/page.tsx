import React from 'react';
import HeroSlider from '@/components/hero/HeroSlider';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import HotProductsSection from '@/components/home/HotProductsSection';
import DealOfTheDay from '@/components/home/DealOfTheDay';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Offer from '@/lib/models/Offer';
import DeletedProduct from '@/lib/models/DeletedProduct';
import FeaturedProduct from '@/lib/models/FeaturedProduct';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const productMap = new Map<string, any>();
  const deletedSet = new Set<string>();
  const featuredSet = new Set<string>();
  const hotSet = new Set<string>();
  let categories: any[] = [];
  let banners: any[] = [];
  let offers: any[] = [];

  const db = await connectToDatabase();

  // 1. Fetch deleted and featured identifiers from MongoDB
  if (db) {
    try {
      const [deletedRecords, featuredRecords] = await Promise.all([
        DeletedProduct.find().lean(),
        FeaturedProduct.find().lean(),
      ]);

      if (deletedRecords && deletedRecords.length > 0) {
        deletedRecords.forEach((d: any) => {
          if (d.identifier) deletedSet.add(String(d.identifier).toLowerCase().trim());
        });
      }

      if (featuredRecords && featuredRecords.length > 0) {
        featuredRecords.forEach((f: any) => {
          const keys = [f.identifier, f.slug, f.name, f.businessKoroId]
            .filter(Boolean)
            .map((s) => String(s).toLowerCase().trim());
          if (f.isFeatured) {
            keys.forEach((k) => featuredSet.add(k));
          } else if (f.isFeatured === false) {
            keys.forEach((k) => featuredSet.delete(k));
          }
          if (f.isHot) {
            keys.forEach((k) => hotSet.add(k));
          } else if (f.isHot === false) {
            keys.forEach((k) => hotSet.delete(k));
          }
        });
      }
    } catch (e) {
      console.warn('DeletedProduct/FeaturedProduct check in page.tsx:', e);
    }
  }

  const checkIsDeleted = (p: any) => {
    const keys = [p._id, p.slug, p.businessKoroId, p.name]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim());
    return keys.some((k) => deletedSet.has(k)) || Boolean(p.isDeleted);
  };

  const checkIsFeatured = (p: any) => {
    const keys = [p._id, p.slug, p.businessKoroId, p.name]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim());
    return keys.some((k) => featuredSet.has(k)) || Boolean(p.isFeatured);
  };

  const checkIsHot = (p: any) => {
    const keys = [p._id, p.slug, p.businessKoroId, p.name]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase().trim());
    return keys.some((k) => hotSet.has(k)) || Boolean(p.isHot);
  };

  // 2. Fetch live products from Business Koro API
  const bkProducts = await fetchBusinessKoroProducts();
  if (bkProducts && bkProducts.length > 0) {
    for (const p of bkProducts) {
      if (checkIsDeleted(p)) {
        continue;
      }

      const isFeat = checkIsFeatured(p);
      const isH = checkIsHot(p);

      productMap.set(p.slug || p._id || p.businessKoroId, { ...p, isFeatured: isFeat, isHot: isH });
    }
  }

  // 3. Fetch local products, banners, categories, and offers from MongoDB
  if (db) {
    try {
      const [localProducts, localCategories, localBanners, localOffers] = await Promise.all([
        Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean(),
        Category.find().lean(),
        Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
        Offer.find({ isActive: true, $or: [{ offerType: 'flash_deal' }, { offerType: { $exists: false } }] }).sort({ order: 1, updatedAt: -1 }).limit(2).lean(),
      ]);

      if (localProducts && localProducts.length > 0) {
        for (const p of JSON.parse(JSON.stringify(localProducts))) {
          if (checkIsDeleted(p)) {
            continue;
          }
          const key = p.slug || p._id || p.businessKoroId;
          const isFeat = checkIsFeatured(p);
          const isH = checkIsHot(p);

          const merged = { ...p, _id: String(p._id), isFeatured: isFeat, isHot: isH };

          if (productMap.has(key)) {
            productMap.set(key, { ...productMap.get(key), ...merged });
          } else {
            productMap.set(key, merged);
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
    } catch (e) {
      console.error('Database query in page.tsx:', e);
    }
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
  const { products, banners, offers } = await getData();

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
