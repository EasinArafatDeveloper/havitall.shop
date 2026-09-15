import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import DeletedProduct from '@/lib/models/DeletedProduct';
import FeaturedProduct from '@/lib/models/FeaturedProduct';
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
    const limit = parseInt(searchParams.get('limit') || '100');

    const productMap = new Map<string, any>();
    const deletedSet = new Set<string>((memoryStore?.deletedProductIds || []).map((s) => String(s).toLowerCase().trim()));
    const featuredSet = new Set<string>((memoryStore?.featuredProductIds || []).map((s) => String(s).toLowerCase().trim()));
    const hotSet = new Set<string>((memoryStore?.hotProductIds || []).map((s) => String(s).toLowerCase().trim()));

    // 1. Fetch deleted and featured records from MongoDB
    try {
      const db = await connectToDatabase();
      if (db) {
        const [deletedRecords, featuredRecords] = await Promise.all([
          DeletedProduct.find().lean(),
          FeaturedProduct.find().lean(),
        ]);

        if (deletedRecords && deletedRecords.length > 0) {
          deletedRecords.forEach((d: any) => {
            if (d.identifier) deletedSet.add(String(d.identifier).toLowerCase().trim());
          });
        }

        if (featuredRecords && featuredRecords.length > 0) {
          featuredRecords.forEach((f: any) => {
            const keys = [f.identifier, f.slug, f.name, f.businessKoroId].filter(Boolean).map((s) => String(s).toLowerCase().trim());
            if (f.isFeatured) {
              keys.forEach((k) => featuredSet.add(k));
            } else if (f.isFeatured === false) {
              keys.forEach((k) => featuredSet.delete(k));
            }
            if (f.isHot) {
              keys.forEach((k) => hotSet.add(k));
            } else if (f.isHot === false) {
              keys.forEach((k) => hotSet.delete(k));
            }
          });
        }
      }
    } catch (e) {
      console.warn('DB query warning in products route:', e);
    }

    const checkIsDeleted = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name].filter(Boolean).map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => deletedSet.has(k));
    };

    const checkIsFeatured = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name].filter(Boolean).map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => featuredSet.has(k)) || Boolean(p.isFeatured);
    };

    const checkIsHot = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name].filter(Boolean).map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => hotSet.has(k)) || Boolean(p.isHot);
    };

    // 2. Fetch live products from Business Koro API
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      for (const p of bkProducts) {
        const key = p.slug || p._id || p.businessKoroId;
        if (checkIsDeleted(p)) {
          continue;
        }

        const isFeat = checkIsFeatured(p);
        const isH = checkIsHot(p);

        productMap.set(key, { ...p, isFeatured: isFeat, isHot: isH });
      }
    }

    // 3. Fetch locally saved/updated products from MongoDB
    try {
      const db = await connectToDatabase();
      if (db) {
        const localProducts = await Product.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).lean();
        if (localProducts && localProducts.length > 0) {
          for (const p of localProducts) {
            const key = p.slug || p._id || p.businessKoroId;
            if (checkIsDeleted(p)) {
              continue;
            }

            const isFeat = checkIsFeatured(p);
            const isH = checkIsHot(p);

            const merged = { ...p, isFeatured: isFeat, isHot: isH };

            if (productMap.has(key)) {
              productMap.set(key, { ...productMap.get(key), ...merged });
            } else {
              productMap.set(key, merged);
            }
          }
        }
      }
    } catch (e) {
      console.warn('MongoDB query fallback in products API:', e);
    }

    // 4. Memory store products (if any custom added in memory)
    if (memoryStore?.products && memoryStore.products.length > 0) {
      for (const p of memoryStore.products) {
        const key = p.slug || p._id || p.businessKoroId;
        if (!checkIsDeleted(p)) {
          const isFeat = checkIsFeatured(p);
          const isH = checkIsHot(p);

          if (!productMap.has(key)) {
            productMap.set(key, { ...p, isFeatured: isFeat, isHot: isH });
          }
        }
      }
    }

    const allProducts = Array.from(productMap.values());

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
      isDeleted: false,
      isFeatured: body.isFeatured ?? false,
      isHot: body.isHot ?? false,
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
