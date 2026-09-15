import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { memoryStore } from '@/lib/memoryStore';
import { fetchBusinessKoroProducts } from '@/lib/businessKoro';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Try Business Koro live products
    const bkProducts = await fetchBusinessKoroProducts();
    if (bkProducts && bkProducts.length > 0) {
      const found = bkProducts.find((p: any) => p._id === id || p.slug === id || p.businessKoroId === id);
      if (found) {
        return NextResponse.json({ success: true, product: found, source: 'businesskoro' });
      }
    }

    // 2. Try MongoDB
    const db = await connectToDatabase();
    if (db) {
      let product = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id).lean();
      }
      if (!product) {
        product = await Product.findOne({ slug: id }).lean();
      }
      if (product) {
        return NextResponse.json({ success: true, product, source: 'mongodb' });
      }
    }

    // 3. Memory store fallback
    const memProduct = memoryStore?.products.find(
      (p) => p._id === id || p.slug === id
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

    if (db) {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        await Product.findByIdAndDelete(id);
      } else {
        await Product.findOneAndDelete({ slug: id });
      }
    }

    // Also remove from memory
    if (memoryStore) {
      memoryStore.products = memoryStore.products.filter(
        (p) => p._id !== id && p.slug !== id
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
