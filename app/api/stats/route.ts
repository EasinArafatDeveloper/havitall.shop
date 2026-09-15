import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalCategories = await Category.countDocuments();
      const totalBanners = await Banner.countDocuments();

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
          totalProducts,
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
        totalProducts: memoryStore?.products.length || 0,
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
