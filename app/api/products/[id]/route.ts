import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import DeletedProduct from '@/lib/models/DeletedProduct';
import FeaturedProduct from '@/lib/models/FeaturedProduct';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const cleanId = id.trim().toLowerCase();
    const db = await connectToDatabase();

    // Check if recorded as deleted
    if (db) {
      const isDeletedRecord = await DeletedProduct.findOne({
        identifier: { $in: [id, cleanId] },
      }).lean();

      if (isDeletedRecord) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
    }

    // 1. Try MongoDB first (customized/local products take priority)
    if (db) {
      const filterConditions: any[] = [];
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        filterConditions.push({ _id: id });
      }
      filterConditions.push({ slug: cleanId });
      filterConditions.push({ businessKoroId: id });

      const product: any = await Product.findOne({
        $or: filterConditions,
        isDeleted: { $ne: true },
      }).lean();

      if (product) {
        return NextResponse.json({
          success: true,
          product: { ...product, _id: String(product._id) },
          source: 'mongodb',
        });
      }
    }

    // 2. Try Business Koro live supplier products
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      const found = bkProducts.find(
        (p: any) =>
          String(p._id).toLowerCase() === cleanId ||
          String(p.slug).toLowerCase() === cleanId ||
          String(p.businessKoroId).toLowerCase() === cleanId
      );

      if (found) {
        // Fetch featured/hot status override if present in DB
        let isFeat = Boolean(found.isFeatured);
        let isH = Boolean(found.isHot);

        if (db) {
          const featRecord: any = await FeaturedProduct.findOne({
            $or: [
              { identifier: id },
              { identifier: cleanId },
              { slug: found.slug },
              { businessKoroId: found.businessKoroId },
            ],
          }).lean();

          if (featRecord) {
            if (featRecord.isFeatured !== undefined) isFeat = Boolean(featRecord.isFeatured);
            if (featRecord.isHot !== undefined) isH = Boolean(featRecord.isHot);
          }
        }

        return NextResponse.json({
          success: true,
          product: { ...found, isFeatured: isFeat, isHot: isH },
          source: 'businesskoro',
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching single product:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const cleanId = id.trim().toLowerCase();

    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) <= 0)) {
      return NextResponse.json({ success: false, error: 'Price must be greater than ৳0.' }, { status: 400 });
    }

    // Calculate discount percentage if original price provided
    if (body.originalPrice !== undefined && body.price !== undefined) {
      const orig = Number(body.originalPrice);
      const prc = Number(body.price);
      if (orig > prc && orig > 0) {
        body.discountPercentage = Math.round(((orig - prc) / orig) * 100);
      } else {
        body.discountPercentage = 0;
      }
    }

    // 1. Sync Featured / Hot flag in FeaturedProduct collection
    if (body.isFeatured !== undefined || body.isHot !== undefined) {
      const matchConditions: any[] = [{ identifier: id }, { identifier: cleanId }];
      if (body.slug) matchConditions.push({ slug: String(body.slug).toLowerCase().trim() });
      if (body.businessKoroId) matchConditions.push({ businessKoroId: String(body.businessKoroId) });

      await FeaturedProduct.findOneAndUpdate(
        { $or: matchConditions },
        {
          $set: {
            identifier: id,
            slug: body.slug || cleanId,
            name: body.name,
            businessKoroId: body.businessKoroId || id,
            ...(body.isFeatured !== undefined ? { isFeatured: Boolean(body.isFeatured) } : {}),
            ...(body.isHot !== undefined ? { isHot: Boolean(body.isHot) } : {}),
          },
        },
        { upsert: true, new: true }
      );
    }

    // 2. Find and update existing product in MongoDB or create a persistent record
    const filterConditions: any[] = [];
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filterConditions.push({ _id: id });
    }
    filterConditions.push({ slug: cleanId });
    filterConditions.push({ businessKoroId: id });
    if (body.slug) filterConditions.push({ slug: String(body.slug).toLowerCase().trim() });
    if (body.businessKoroId) filterConditions.push({ businessKoroId: String(body.businessKoroId) });
    if (body._id && String(body._id).match(/^[0-9a-fA-F]{24}$/)) {
      filterConditions.push({ _id: body._id });
    }

    let existingProduct = await Product.findOne({ $or: filterConditions });
    let savedProduct: any = null;

    if (existingProduct) {
      // Update existing MongoDB document
      if (body.name) existingProduct.name = body.name.trim();
      if (body.price !== undefined) existingProduct.price = Number(body.price);
      if (body.originalPrice !== undefined) existingProduct.originalPrice = Number(body.originalPrice);
      if (body.discountPercentage !== undefined) existingProduct.discountPercentage = Number(body.discountPercentage);
      if (body.category) existingProduct.category = body.category.trim();
      if (body.stock !== undefined) existingProduct.stock = Number(body.stock);
      if (body.description) existingProduct.description = body.description;
      if (body.shortDescription !== undefined) existingProduct.shortDescription = body.shortDescription;
      if (body.images && Array.isArray(body.images) && body.images.length > 0) existingProduct.images = body.images;
      if (body.isHot !== undefined) existingProduct.isHot = Boolean(body.isHot);
      if (body.isFeatured !== undefined) existingProduct.isFeatured = Boolean(body.isFeatured);
      if (body.badge !== undefined) existingProduct.badge = body.badge;
      if (body.variants) existingProduct.variants = body.variants;
      if (body.features) existingProduct.features = body.features;
      if (body.tags) existingProduct.tags = body.tags;
      if (body.slug) existingProduct.slug = String(body.slug).toLowerCase().trim();
      if (body.businessKoroId) existingProduct.businessKoroId = String(body.businessKoroId);
      existingProduct.isDeleted = false;
      existingProduct.source = 'customized';

      savedProduct = await existingProduct.save();
    } else {
      // Product was originally from Business Koro / external and is now being saved into MongoDB
      const bkProducts = await fetchBusinessKoroProducts();
      const bkOriginal = bkProducts?.find(
        (p: any) =>
          String(p._id).toLowerCase() === cleanId ||
          String(p.slug).toLowerCase() === cleanId ||
          String(p.businessKoroId).toLowerCase() === cleanId
      );

      const targetSlug = (
        body.slug ||
        bkOriginal?.slug ||
        (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : cleanId)
      ).toLowerCase().trim();

      const newProductDoc = {
        name: body.name || bkOriginal?.name || 'Custom Product',
        slug: targetSlug,
        businessKoroId: body.businessKoroId || bkOriginal?.businessKoroId || id,
        description: body.description || bkOriginal?.description || 'Premium lifestyle product.',
        shortDescription: body.shortDescription || bkOriginal?.shortDescription || '',
        price: body.price !== undefined ? Number(body.price) : (bkOriginal?.price || 999),
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : bkOriginal?.originalPrice,
        discountPercentage: body.discountPercentage !== undefined ? Number(body.discountPercentage) : (bkOriginal?.discountPercentage || 0),
        category: body.category || bkOriginal?.category || 'all-collection',
        images: Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : (bkOriginal?.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000']),
        stock: body.stock !== undefined ? Number(body.stock) : (bkOriginal?.stock ?? 10),
        rating: bkOriginal?.rating || 4.8,
        numReviews: bkOriginal?.numReviews || 12,
        isHot: body.isHot !== undefined ? Boolean(body.isHot) : Boolean(bkOriginal?.isHot),
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : Boolean(bkOriginal?.isFeatured),
        badge: body.badge || bkOriginal?.badge || '',
        variants: body.variants || bkOriginal?.variants || { colors: [], sizes: [] },
        features: body.features || bkOriginal?.features || [],
        tags: body.tags || bkOriginal?.tags || [],
        isDeleted: false,
        source: 'customized',
      };

      savedProduct = await Product.findOneAndUpdate(
        { slug: targetSlug },
        { $set: newProductDoc },
        { upsert: true, new: true, runValidators: true }
      );
    }

    return NextResponse.json({
      success: true,
      product: { ...savedProduct.toObject ? savedProduct.toObject() : savedProduct, _id: String(savedProduct._id) },
      source: 'mongodb',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating product:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    // Record deletion identifier in DeletedProduct collection
    await DeletedProduct.findOneAndUpdate(
      { identifier: id },
      { $set: { identifier: id, deletedAt: new Date() } },
      { upsert: true }
    );

    // Delete or mark deleted in Product collection
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await Product.findByIdAndUpdate(id, { $set: { isDeleted: true } });
    } else {
      await Product.updateMany(
        { $or: [{ slug: id.toLowerCase() }, { businessKoroId: id }, { _id: id }] },
        { $set: { isDeleted: true } }
      );
    }

    // Remove from FeaturedProduct if present
    await FeaturedProduct.deleteMany({
      $or: [{ identifier: id }, { slug: id }, { businessKoroId: id }],
    });

    return NextResponse.json({ success: true, message: 'Product deleted permanently' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting product:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
