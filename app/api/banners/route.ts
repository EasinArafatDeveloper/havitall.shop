import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
      if (banners && banners.length > 0) {
        return NextResponse.json({ success: true, banners, source: 'mongodb' });
      }
    }

    return NextResponse.json({
      success: true,
      banners: memoryStore?.banners.filter((b) => b.isActive) || [],
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, image } = body;

    if (!title || !image) {
      return NextResponse.json({ success: false, error: 'Title and image are required' }, { status: 400 });
    }

    const newBannerData = {
      title,
      subtitle: body.subtitle || '',
      tagline: body.tagline || 'SPECIAL FEATURE',
      image,
      buttonText: body.buttonText || 'Shop Now',
      buttonLink: body.buttonLink || '/shop',
      discountBadge: body.discountBadge || '',
      bgColor: body.bgColor || 'from-slate-950 via-rose-950/80 to-slate-900',
      order: Number(body.order || 0),
      isActive: body.isActive ?? true,
    };

    const db = await connectToDatabase();
    if (db) {
      const banner = await Banner.create(newBannerData);
      memoryStore?.banners.unshift(banner.toObject());
      return NextResponse.json({ success: true, banner, source: 'mongodb' });
    }

    const memBanner = {
      ...newBannerData,
      _id: `ban_${Date.now()}`,
    };
    memoryStore?.banners.unshift(memBanner);

    return NextResponse.json({ success: true, banner: memBanner, source: 'memory' });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db && id.match(/^[0-9a-fA-F]{24}$/)) {
      await Banner.findByIdAndDelete(id);
    }

    if (memoryStore) {
      memoryStore.banners = memoryStore.banners.filter((b) => b._id !== id);
    }

    return NextResponse.json({ success: true, message: 'Banner removed' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
