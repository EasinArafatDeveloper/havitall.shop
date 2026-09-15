import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Order from '@/lib/models/Order';
import Offer from '@/lib/models/Offer';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  return handleCleanup();
}

export async function POST() {
  return handleCleanup();
}

export async function DELETE() {
  return handleCleanup();
}

async function handleCleanup() {
  try {
    const db = await connectToDatabase();
    if (db) {
      // Clear demo products with tags or mock slugs
      await Product.deleteMany({
        $or: [
          { tags: { $in: ['audio', 'luxury', 'leather', 'keyboard', 'sunglasses', 'sneakers', 'decor', 'magsafe'] } },
          { slug: { $in: [
            'aura-pro-wireless-anc-headphones',
            'havitall-chrono-swiss-automatic-watch',
            'roma-handcrafted-leather-briefpack',
            'nova-84-custom-mechanical-keyboard',
            'spectra-matrix-polarized-sunglasses',
            'pulse-ultra-hybrid-carbon-runner',
            'lumina-smart-mood-bar-rgb-lamp',
            'velocita-magnetic-leather-magsafe-wallet'
          ] } },
        ]
      });

      // Clear demo banners
      await Banner.deleteMany({
        title: { $in: [
          'Aura Pro Wireless ANC Studio Edition',
          'HavItAll Chrono Luxury Heritage Watch',
          'Minimalist Italian Full-Grain Leather Pack',
          'Cyberpunk Custom RGB Mechanical Keyboard'
        ] }
      });

      // Clear demo categories
      await Category.deleteMany({
        slug: { $in: [
          'luxury-watches',
          'audio-acoustics',
          'bags-leather',
          'smart-gadgets',
          'eyewear-shades',
          'footwear-kicks'
        ] }
      });

      // Clear demo orders
      await Order.deleteMany({
        orderNumber: { $in: ['HAV-8092', 'HAV-8091'] }
      });
    }

    if (memoryStore) {
      memoryStore.products = [];
      memoryStore.categories = [];
      memoryStore.banners = [];
      memoryStore.orders = [];
      memoryStore.offers = [];
      memoryStore.deletedProductIds = [];
    }

    return NextResponse.json({
      success: true,
      message: 'All demo data cleaned up successfully! Store is now 100% clean and ready for real Business Koro & custom data.',
    });
  } catch (error: any) {
    console.error('Error cleaning demo data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
