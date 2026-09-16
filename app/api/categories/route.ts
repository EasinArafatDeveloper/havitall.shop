import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const categories = await Category.find().sort({ name: 1 }).lean();
      return NextResponse.json({ success: true, categories: categories || [], source: 'mongodb' });
    }

    return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching categories:', err.message);
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
    const { name, image, icon, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Valid category name is required' }, { status: 400 });
    }

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCatData = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description ? String(description).trim() : `Shop exclusive ${name.trim()} collection`,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
      icon: icon || 'Tag',
      featured: body.featured ?? true,
      itemCount: 0,
    };

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const cat = await Category.findOneAndUpdate(
      { slug: newCatData.slug },
      { $set: newCatData },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, category: cat, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating category:', err.message);
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
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await Category.findByIdAndDelete(id);
    } else {
      await Category.findOneAndDelete({ $or: [{ slug: id.toLowerCase() }, { name: id }] });
    }

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting category:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
