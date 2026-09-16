import { NextResponse } from 'next/server';
import { formatBusinessKoroProduct } from '@/lib/businessKoro';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { verifyAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin credentials required to trigger supplier synchronization.' },
      { status: 401 }
    );
  }

  try {
    const apiKey = process.env.BUSINESS_KORO_API_KEY;
    const origin = process.env.BUSINESS_KORO_ORIGIN || 'https://havitall.shop';
    const baseUrl = process.env.BUSINESS_KORO_BASE_URL || 'https://api.businesskoro.com/api/v1/storefront';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'BUSINESS_KORO_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

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
      });
    }

    const rawProducts = Array.isArray(json)
      ? json
      : json?.data || json?.products || json?.result || [];

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: 'Connected to Business Koro successfully, but no products are published in your supplier storefront catalog yet.',
      });
    }

    // Format all products
    const formatted = rawProducts.map((p: any, i: number) => formatBusinessKoroProduct(p, i));

    // Save/Update in MongoDB atomically
    const db = await connectToDatabase();
    if (db) {
      for (const prod of formatted) {
        await Product.findOneAndUpdate(
          { slug: prod.slug },
          { $set: prod },
          { upsert: true, new: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      count: formatted.length,
      message: `Successfully connected and synced ${formatted.length} live products from Business Koro into database!`,
      products: formatted.slice(0, 5),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Business Koro Sync Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
