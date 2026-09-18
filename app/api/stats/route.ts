import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin credentials required.' },
      { status: 401 }
    );
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const deletedSet = new Set<string>();
    try {
      const deletedRecords = await DeletedProduct.find().lean();
      if (deletedRecords && deletedRecords.length > 0) {
        deletedRecords.forEach((d: any) => {
          if (d.identifier) deletedSet.add(String(d.identifier).toLowerCase().trim());
        });
      }
    } catch (e) {
      console.warn('DeletedProduct query in stats:', e);
    }

    // Count distinct active products (BK + local)
    const productKeys = new Set<string>();
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      for (const p of bkProducts) {
        const idStr = String(p._id).toLowerCase();
        const slugStr = String(p.slug).toLowerCase();
        const bkIdStr = String(p.businessKoroId).toLowerCase();

        if (!deletedSet.has(idStr) && !deletedSet.has(slugStr) && !deletedSet.has(bkIdStr)) {
          productKeys.add(slugStr || idStr);
        }
      }
    }

    const localProducts = await Product.find({ isDeleted: { $ne: true } }).lean();
    if (localProducts && localProducts.length > 0) {
      for (const p of localProducts) {
        const idStr = String(p._id).toLowerCase();
        const slugStr = String(p.slug).toLowerCase();
        const bkIdStr = String(p.businessKoroId || '').toLowerCase();

        if (!deletedSet.has(idStr) && !deletedSet.has(slugStr) && !deletedSet.has(bkIdStr)) {
          productKeys.add(slugStr || idStr);
        }
      }
    }

    const [totalOrders, totalCategories, totalBanners, orders] = await Promise.all([
      Order.countDocuments(),
      Category.countDocuments(),
      Banner.countDocuments({ isActive: true }),
      Order.find().lean(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o) => o.orderStatus === 'Placed' || (o.paymentStatus === 'Pending' && o.orderStatus !== 'Cancelled')).length;
    const processingOrders = orders.filter((o) => o.orderStatus === 'Processing' || o.orderStatus === 'Confirmed').length;
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error getting stats:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
