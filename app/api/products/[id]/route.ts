import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import DeletedProduct from '@/lib/models/DeletedProduct';
import { memoryStore } from '@/lib/memoryStore';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 0. Check if deleted
    if (memoryStore?.deletedProductIds?.includes(id)) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const db = await connectToDatabase();
    if (db) {
      const isDeletedRecord = await DeletedProduct.findOne({ identifier: id }).lean();
      if (isDeletedRecord) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
    }

    // 1. Try Business Koro live products
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      const found = bkProducts.find((p: any) => p._id === id || p.slug === id || p.businessKoroId === id || p.id === id);
      if (found) {
        return NextResponse.json({ success: true, product: found, source: 'businesskoro' });
      }
    }

    // 2. Try MongoDB
    if (db) {
      let product = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
      }
      if (!product) {
        product = await Product.findOne({ slug: id, isDeleted: { $ne: true } }).lean();
      }
      if (!product) {
        product = await Product.findOne({ businessKoroId: id, isDeleted: { $ne: true } }).lean();
      }
      if (product) {
        return NextResponse.json({ success: true, product, source: 'mongodb' });
      }
    }

    // 3. Memory store fallback
    const memProduct = memoryStore?.products.find(
      (p) => (p._id === id || p.slug === id || p.businessKoroId === id) && !memoryStore.deletedProductIds?.includes(id)
    );

    if (!memProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: memProduct, source: 'memory' });
  } catch (error: any) {
    console.error('Error fetching single product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const db = await connectToDatabase();

    if (body.originalPrice && body.price && Number(body.originalPrice) > Number(body.price)) {
      body.discountPercentage = Math.round(
        ((Number(body.originalPrice) - Number(body.price)) / Number(body.originalPrice)) * 100
      );
    }

    // 1. Update memory store
    if (memoryStore) {
      const memIdx = memoryStore.products.findIndex((p) => p._id === id || p.slug === id || p.businessKoroId === id);
      if (memIdx >= 0) {
        memoryStore.products[memIdx] = {
          ...memoryStore.products[memIdx],
          ...body,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    // 2. Update MongoDB if connected
    if (db) {
      let updated = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        updated = await Product.findByIdAndUpdate(id, body, { new: true }).lean();
      } else {
        updated = await Product.findOneAndUpdate(
          { $or: [{ slug: id }, { businessKoroId: id }, { _id: id }] },
          body,
          { new: true, upsert: true }
        ).lean();
      }
      if (updated) {
        return NextResponse.json({ success: true, product: updated, source: 'mongodb' });
      }
    }

    const memProduct = memoryStore?.products.find((p) => p._id === id || p.slug === id || p.businessKoroId === id);
    return NextResponse.json({
      success: true,
      product: memProduct || body,
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    // 1. Permanently record deletion identifier in MongoDB
    if (db) {
      try {
        await DeletedProduct.findOneAndUpdate(
          { identifier: id },
          { identifier: id, deletedAt: new Date() },
          { upsert: true }
        );

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
          await Product.findByIdAndDelete(id);
        } else {
          await Product.findOneAndDelete({ $or: [{ slug: id }, { businessKoroId: id }, { _id: id }] });
        }
      } catch (dbErr) {
        console.warn('MongoDB product deletion error:', dbErr);
      }
    }

    // 2. Add to memory store deleted tracking & clean memory list
    if (memoryStore) {
      if (!memoryStore.deletedProductIds) {
        memoryStore.deletedProductIds = [];
      }
      if (!memoryStore.deletedProductIds.includes(id)) {
        memoryStore.deletedProductIds.push(id);
      }
      memoryStore.products = memoryStore.products.filter(
        (p) => p._id !== id && p.slug !== id && p.businessKoroId !== id
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted permanently' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
