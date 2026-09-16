import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';
import Order from '@/lib/models/Order';
import Offer from '@/lib/models/Offer';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { verifyAdminSession } from '@/lib/auth';

// Only allow authenticated admin POST requests
export async function POST(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin credentials required to reset demo data.' }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection unavailable.' }, { status: 503 });
    }

    // Clear demo products
    await Product.deleteMany({
      $or: [
        { tags: { $in: ['audio', 'luxury', 'leather', 'keyboard', 'sunglasses', 'sneakers', 'decor', 'magsafe'] } },
        {
          slug: {
            $in: [
              'aura-pro-wireless-anc-headphones',
              'havitall-chrono-swiss-automatic-watch',
              'roma-handcrafted-leather-briefpack',
              'nova-84-custom-mechanical-keyboard',
              'spectra-matrix-polarized-sunglasses',
              'pulse-ultra-hybrid-carbon-runner',
              'lumina-smart-mood-bar-rgb-lamp',
              'velocita-magnetic-leather-magsafe-wallet',
            ],
          },
        },
      ],
    });

    // Clear demo banners
    await Banner.deleteMany({
      title: {
        $in: [
          'Aura Pro Wireless ANC Studio Edition',
          'HavItAll Chrono Luxury Heritage Watch',
          'Minimalist Italian Full-Grain Leather Pack',
          'Cyberpunk Custom RGB Mechanical Keyboard',
        ],
      },
    });

    // Clear demo categories
    await Category.deleteMany({
      slug: {
        $in: [
          'luxury-watches',
          'audio-acoustics',
          'bags-leather',
          'smart-gadgets',
          'eyewear-shades',
          'footwear-kicks',
        ],
      },
    });

    // Clear demo orders
    await Order.deleteMany({
      orderNumber: { $in: ['HAV-8092', 'HAV-8091'] },
    });

    return NextResponse.json({
      success: true,
      message: 'Demo presets cleaned up successfully. Database is now in clean state.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in seed cleanup:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
