import { NextResponse } from 'next/server';
import { formatBusinessKoroProduct } from '@/lib/businessKoro';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { memoryStore } from '@/lib/memoryStore';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey || process.env.BUSINESS_KORO_API_KEY || 'bkr_5c498792bc7ad09dbc6c1426c341ef8c0a581bd577065feb0';
    const origin = body.origin || process.env.BUSINESS_KORO_ORIGIN || 'https://havitall.shop';
    const baseUrl = process.env.BUSINESS_KORO_BASE_URL || 'https://api.businesskoro.com/api/v1/storefront';

    console.log(`[Business Koro Sync] Fetching products with key: ${apiKey.substring(0, 8)}... and Origin: ${origin}`);

    const res = await fetch(`${baseUrl}/products`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey.trim(),
        'Origin': origin.trim(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { rawText: text };
    }

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        status: res.status,
        error: json?.message || `Business Koro API returned status ${res.status}`,
        details: json,
      });
    }

    const rawProducts = Array.isArray(json)
      ? json
      : json.data || json.products || json.result || [];

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Connected to Business Koro successfully, but no products are published to your storefront catalog yet.',
        rawResponse: json,
      });
    }

    // Format all products
    const formatted = rawProducts.map((p: any, i: number) => formatBusinessKoroProduct(p, i));

    // Save to MongoDB
    const db = await connectToDatabase();
    if (db) {
      for (const prod of formatted) {
        await Product.findOneAndUpdate(
          { $or: [{ slug: prod.slug }, { businessKoroId: prod.businessKoroId }] },
          prod,
          { upsert: true, new: true }
        );
      }
    }

    // Update memory store
    if (memoryStore) {
      memoryStore.products = formatted;
    }

    return NextResponse.json({
      success: true,
      count: formatted.length,
      message: `Successfully synced ${formatted.length} live products from Business Koro!`,
      products: formatted.slice(0, 5),
    });
  } catch (error: any) {
    console.error('[Business Koro Sync Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
