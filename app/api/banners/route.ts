import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
      return NextResponse.json({ success: true, banners: banners || [], source: 'mongodb' });
    }

    return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching banners:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, image } = body;

    if (!title || typeof title !== 'string' || !title.trim() || !image) {
      return NextResponse.json({ success: false, error: 'Title and image are required' }, { status: 400 });
    }

    const newBannerData = {
      title: title.trim(),
      subtitle: body.subtitle ? String(body.subtitle).trim() : '',
      tagline: body.tagline ? String(body.tagline).trim() : 'SPECIAL FEATURE',
      image: String(image).trim(),
      buttonText: body.buttonText ? String(body.buttonText).trim() : 'Shop Now',
      buttonLink: body.buttonLink ? String(body.buttonLink).trim() : '/shop',
      discountBadge: body.discountBadge ? String(body.discountBadge).trim() : '',
      bgColor: body.bgColor || 'from-slate-950 via-rose-950/80 to-slate-900',
      order: Number(body.order || 0),
      isActive: body.isActive ?? true,
    };

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const banner = await Banner.create(newBannerData);
    return NextResponse.json({ success: true, banner, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating banner:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const id = searchParams.get('id') || body._id || body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required for update' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.image !== undefined) updateData.image = String(body.image).trim();
    if (body.buttonLink !== undefined) updateData.buttonLink = String(body.buttonLink).trim();
    if (body.buttonText !== undefined) updateData.buttonText = String(body.buttonText).trim();
    if (body.subtitle !== undefined) updateData.subtitle = String(body.subtitle).trim();
    if (body.tagline !== undefined) updateData.tagline = String(body.tagline).trim();
    if (body.discountBadge !== undefined) updateData.discountBadge = String(body.discountBadge).trim();
    if (body.bgColor !== undefined) updateData.bgColor = body.bgColor;
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    let updatedBanner = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      updatedBanner = await Banner.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    } else {
      updatedBanner = await Banner.findOneAndUpdate({ $or: [{ _id: id }, { title: id }] }, { $set: updateData }, { new: true });
    }

    if (!updatedBanner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner: updatedBanner, message: 'Hero poster updated successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating banner:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await Banner.findByIdAndDelete(id);
    } else {
      await Banner.findOneAndDelete({ $or: [{ _id: id }, { title: id }] });
    }

    return NextResponse.json({ success: true, message: 'Banner removed' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting banner:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
