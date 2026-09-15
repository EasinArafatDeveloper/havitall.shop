import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { memoryStore } from '@/lib/memoryStore';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const deletedSet = new Set<string>(memoryStore?.deletedProductIds || []);

    if (db) {
      try {
        const deletedRecords = await DeletedProduct.find().lean();
        if (deletedRecords && deletedRecords.length > 0) {
          deletedRecords.forEach((d: any) => {
            if (d.identifier) deletedSet.add(d.identifier);
          });
        }
      } catch (e) {
        console.warn('DeletedProduct query warning in stats:', e);
      }
    }

    // Count distinct active products (BK + local)
    const productKeys = new Set<string>();
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      for (const p of bkProducts) {
        if (!deletedSet.has(String(p._id)) && !deletedSet.has(String(p.slug)) && !deletedSet.has(String(p.businessKoroId))) {
          productKeys.add(p.slug || p._id);
        }
      }
    }

    if (db) {
      const localProducts = await Product.find({ isDeleted: { $ne: true } }).lean();
      if (localProducts && localProducts.length > 0) {
        for (const p of localProducts) {
          if (!deletedSet.has(String(p._id)) && !deletedSet.has(String(p.slug)) && !deletedSet.has(String(p.businessKoroId))) {
            productKeys.add(p.slug || p._id);
          }
        }
      }

      const totalOrders = await Order.countDocuments();
      const totalCategories = await Category.countDocuments();
      const totalBanners = await Banner.countDocuments({ isActive: true });

      const orders = await Order.find().lean();
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = orders.filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Pending').length;
      const processingOrders = orders.filter((o) => o.orderStatus === 'Processing').length;
      const shippedOrders = orders.filter((o) => o.orderStatus === 'Shipped').length;
      const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;

      return NextResponse.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts: productKeys.size,
          totalCategories,
          totalBanners,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
        },
        source: 'mongodb',
      });
    }

    const orders = memoryStore?.orders || [];
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o: any) => o.orderStatus === 'Placed' || o.orderStatus === 'Pending').length;
    const processingOrders = orders.filter((o: any) => o.orderStatus === 'Processing').length;
    const shippedOrders = orders.filter((o: any) => o.orderStatus === 'Shipped').length;
    const deliveredOrders = orders.filter((o: any) => o.orderStatus === 'Delivered').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: productKeys.size || (memoryStore?.products.length || 0),
        totalCategories: memoryStore?.categories.length || 0,
        totalBanners: memoryStore?.banners.length || 0,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
      },
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
