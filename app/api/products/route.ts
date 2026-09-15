import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { memoryStore } from '@/lib/memoryStore';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isHot = searchParams.get('isHot');
    const isFeatured = searchParams.get('isFeatured');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '50');

    let allProducts: any[] = [];

    // 1. Fetch live products from Business Koro API
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      allProducts.push(...bkProducts);
    }

    // 2. Fetch locally added products from MongoDB
    try {
      const db = await connectToDatabase();
      if (db) {
        const localProducts = await Product.find().sort({ createdAt: -1 }).lean();
        if (localProducts && localProducts.length > 0) {
          allProducts.push(...localProducts);
        }
      }
    } catch (e) {
      console.warn('MongoDB query fallback in products API:', e);
    }

    // 3. Fallback to memory store if no products found yet
    if (allProducts.length === 0) {
      allProducts = [...(memoryStore?.products || [])];
    }

    // Apply filtering
    let filtered = [...allProducts];

    if (category && category !== 'all' && category !== 'all-collection') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (isHot === 'true') {
      filtered = filtered.filter((p) => p.isHot);
    }
    if (isFeatured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(s))
      );
    }

    // Apply sorting
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      products: filtered.slice(0, limit),
      count: filtered.length,
      source: bkProducts && bkProducts.length > 0 ? 'businesskoro' : 'local',
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, description, images } = body;

    if (!name || !price || !category || !description) {
      return NextResponse.json(
        { success: false, error: 'Name, price, category, and description are required' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newProductData = {
      ...body,
      slug,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'],
      stock: Number(body.stock || 10),
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discountPercentage: body.originalPrice && body.originalPrice > body.price
        ? Math.round(((body.originalPrice - body.price) / body.originalPrice) * 100)
        : (body.discountPercentage || 0),
    };

    const db = await connectToDatabase();
    if (db) {
      const product = await Product.create(newProductData);
      // Also update memory store
      memoryStore?.products.unshift(product.toObject());
      return NextResponse.json({ success: true, product, source: 'mongodb' });
    }

    const memProduct = {
      ...newProductData,
      _id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore?.products.unshift(memProduct);

    return NextResponse.json({ success: true, product: memProduct, source: 'memory' });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
