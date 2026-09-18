import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import DeletedProduct from '@/lib/models/DeletedProduct';
import FeaturedProduct from '@/lib/models/FeaturedProduct';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isHot = searchParams.get('isHot');
    const isFeatured = searchParams.get('isFeatured');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const productMap = new Map<string, any>();
    const deletedSet = new Set<string>();
    const featuredSet = new Set<string>();
    const hotSet = new Set<string>();

    const db = await connectToDatabase();

    // 1. Fetch deleted & featured flags from MongoDB
    if (db) {
      try {
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
            const keys = [f.identifier, f.slug, f.name, f.businessKoroId]
              .filter(Boolean)
              .map((s) => String(s).toLowerCase().trim());
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
      } catch (e) {
        console.warn('DB query warning for deleted/featured products:', e);
      }
    }

    const checkIsDeleted = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => deletedSet.has(k)) || Boolean(p.isDeleted);
    };

    const checkIsFeatured = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => featuredSet.has(k)) || Boolean(p.isFeatured);
    };

    const checkIsHot = (p: any) => {
      const keys = [p._id, p.slug, p.businessKoroId, p.name]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase().trim());
      return keys.some((k) => hotSet.has(k)) || Boolean(p.isHot);
    };

    // 2. Fetch live products from Business Koro API
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      for (const p of bkProducts) {
        const key = (p.slug || p._id || p.businessKoroId).toLowerCase();
        if (checkIsDeleted(p)) {
          continue;
        }

        const isFeat = checkIsFeatured(p);
        const isH = checkIsHot(p);

        productMap.set(key, { ...p, isFeatured: isFeat, isHot: isH });
      }
    }

    // 3. Fetch local database products from MongoDB (overrides supplier data)
    if (db) {
      try {
        const localProducts = await Product.find({ isDeleted: { $ne: true } })
          .sort({ createdAt: -1 })
          .lean();

        if (localProducts && localProducts.length > 0) {
          for (const p of localProducts) {
            if (checkIsDeleted(p)) {
              continue;
            }

            const isFeat = checkIsFeatured(p);
            const isH = checkIsHot(p);
            const merged = { ...p, _id: String(p._id), isFeatured: isFeat, isHot: isH };

            // Check if there is an existing matching entry in productMap (from Business Koro)
            let matchedKey: string | null = null;
            productMap.forEach((bkP, k) => {
              if (
                !matchedKey && (
                  (p.businessKoroId && (bkP.businessKoroId === p.businessKoroId || bkP._id === p.businessKoroId)) ||
                  (p.slug && (bkP.slug === p.slug || k === p.slug.toLowerCase())) ||
                  (String(p._id) === String(bkP._id))
                )
              ) {
                matchedKey = k;
              }
            });

            if (matchedKey) {
              const prev = productMap.get(matchedKey);
              productMap.delete(matchedKey);
              const newKey = (p.slug || String(p._id)).toLowerCase();
              productMap.set(newKey, { ...prev, ...merged });
            } else {
              const key = (p.slug || String(p._id) || p.businessKoroId).toLowerCase();
              productMap.set(key, merged);
            }
          }
        }
      } catch (e) {
        console.warn('MongoDB query warning in products API:', e);
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
    let matchingCategories: string[] = [];

    if (search) {
      const rawQuery = search.toLowerCase().trim();
      const terms = rawQuery.split(/\s+/).filter(Boolean);

      // Extract matching categories
      const allCategories = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)));
      matchingCategories = allCategories.filter((cat) =>
        cat.toLowerCase().includes(rawQuery) || terms.some((t) => cat.toLowerCase().includes(t))
      );

      filtered = filtered
        .map((p) => {
          const name = (p.name || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const tags = (p.tags || []).map((t: string) => t.toLowerCase());

          // Check if all terms match
          const allTermsMatch = terms.every(
            (t) =>
              name.includes(t) ||
              desc.includes(t) ||
              cat.includes(t) ||
              brand.includes(t) ||
              tags.some((tag: string) => tag.includes(t))
          );

          if (!allTermsMatch) return null;

          // Score relevance
          let score = 0;
          if (name === rawQuery) score += 100;
          else if (name.startsWith(rawQuery)) score += 50;
          else if (name.includes(rawQuery)) score += 30;
          
          if (cat.includes(rawQuery)) score += 20;
          if (brand.includes(rawQuery)) score += 15;
          if (tags.some((t: string) => t.includes(rawQuery))) score += 10;
          if (p.isHot) score += 5;
          if (p.isFeatured) score += 5;

          return { ...p, _searchScore: score };
        })
        .filter(Boolean) as any[];

      // Sort by relevance score if no custom sort
      if (!searchParams.get('sort')) {
        filtered.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
      }
    }

    // Apply sorting
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (!search) filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      success: true,
      products: filtered.slice(0, limit),
      matchingCategories,
      count: filtered.length,
      source: bkProducts && bkProducts.length > 0 ? 'businesskoro' : 'mongodb',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching products:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Protect with admin session
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, price, category, description, images } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Valid product name is required.' }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Price must be greater than ৳0.' }, { status: 400 });
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid category is required.' }, { status: 400 });
    }

    const slug =
      body.slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const originalPrice = body.originalPrice ? Number(body.originalPrice) : undefined;
    const discountPercentage = originalPrice && originalPrice > numPrice
      ? Math.round(((originalPrice - numPrice) / originalPrice) * 100)
      : (Number(body.discountPercentage) || 0);

    const newProductData = {
      ...body,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      category: category.trim(),
      description: description ? String(description).trim() : `${name.trim()} - Luxury lifestyle item.`,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'],
      videoUrl: body.videoUrl ? String(body.videoUrl).trim() : undefined,
      stock: Math.max(0, parseInt(String(body.stock || 10), 10)),
      price: numPrice,
      originalPrice,
      discountPercentage,
      isDeleted: false,
      isFeatured: Boolean(body.isFeatured),
      isHot: Boolean(body.isHot),
      source: 'local',
    };

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const product = await Product.create(newProductData);
    return NextResponse.json({ success: true, product, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating product:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
