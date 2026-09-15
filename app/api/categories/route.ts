import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const categories = await Category.find().sort({ name: 1 }).lean();
      return NextResponse.json({ success: true, categories: categories || [], source: 'mongodb' });
    }

    return NextResponse.json({
      success: true,
      categories: memoryStore?.categories || [],
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, image, icon, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCatData = {
      name,
      slug,
      description: description || `Shop exclusive ${name} collection`,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
      icon: icon || 'Tag',
      featured: body.featured ?? true,
      itemCount: 0,
    };

    const db = await connectToDatabase();
    if (db) {
      const cat = await Category.create(newCatData);
      memoryStore?.categories.push(cat.toObject());
      return NextResponse.json({ success: true, category: cat, source: 'mongodb' });
    }

    const memCat = {
      ...newCatData,
      _id: `cat_${Date.now()}`,
    };
    memoryStore?.categories.push(memCat);

    return NextResponse.json({ success: true, category: memCat, source: 'memory' });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await Category.findByIdAndDelete(id);
      } else {
        await Category.findOneAndDelete({ $or: [{ slug: id }, { name: id }, { _id: id }] });
      }
    }

    if (memoryStore) {
      memoryStore.categories = memoryStore.categories.filter(
        (c) => c._id !== id && c.slug !== id && c.name !== id
      );
    }

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
