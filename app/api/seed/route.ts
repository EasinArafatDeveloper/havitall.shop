import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Order from '@/lib/models/Order';
import { initialProducts, initialCategories, initialBanners, initialOrders } from '@/lib/seedData';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    const db = await connectToDatabase();
    if (db) {
      // Clear existing test collections
      await Product.deleteMany({});
      await Category.deleteMany({});
      await Banner.deleteMany({});
      await Order.deleteMany({});

      // Insert luxury seeded data
      await Product.insertMany(initialProducts);
      await Category.insertMany(initialCategories);
      await Banner.insertMany(initialBanners);
      await Order.insertMany(initialOrders);

      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully with luxury HavItAll demo data!',
        counts: {
          products: initialProducts.length,
          categories: initialCategories.length,
          banners: initialBanners.length,
          orders: initialOrders.length,
        },
        source: 'mongodb',
      });
    }

    // Reset memory store
    if (memoryStore) {
      memoryStore.products = JSON.parse(JSON.stringify(initialProducts)).map((p: any, i: number) => ({
        ...p,
        _id: `prod_${i + 1}`,
        createdAt: new Date().toISOString(),
      }));
      memoryStore.categories = JSON.parse(JSON.stringify(initialCategories)).map((c: any, i: number) => ({
        ...c,
        _id: `cat_${i + 1}`,
      }));
      memoryStore.banners = JSON.parse(JSON.stringify(initialBanners)).map((b: any, i: number) => ({
        ...b,
        _id: `ban_${i + 1}`,
      }));
      memoryStore.orders = JSON.parse(JSON.stringify(initialOrders)).map((o: any, i: number) => ({
        ...o,
        _id: `ord_${i + 1}`,
      }));
    }

    return NextResponse.json({
      success: true,
      message: 'Memory store reset with luxury demo data!',
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
