import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Offer from '@/lib/models/Offer';
import { pushOrderToBusinessKoro, fetchBusinessKoroProducts } from '@/lib/businessKoro';
import { verifyAdminSession } from '@/lib/auth';

const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 1500);

export async function GET(request: Request) {
  // Protect customer order listing with admin auth
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin credentials required to view order database.' },
      { status: 401 }
    );
  }

  try {
    const db = await connectToDatabase();
    if (db) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, orders: orders || [], source: 'mongodb' });
    }

    return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching orders:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customer, items, couponCode, paymentMethod = 'COD' } = body;

    // 1. Validate Customer Information
    if (
      !customer ||
      !customer.fullName?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid customer name, phone, address, and at least one item are required.' },
        { status: 400 }
      );
    }

    // Validate phone number format (11-digit Bangladeshi mobile number)
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Customer phone must be a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database connection currently unavailable.' }, { status: 503 });
    }

    // 2. Fetch Active Products & Active Offers for Server-Side Price Verification
    const [dbProducts, activeOffers, bkProducts] = await Promise.all([
      Product.find({ isDeleted: { $ne: true } }).lean(),
      Offer.find({ isActive: true }).lean(),
      fetchBusinessKoroProducts(),
    ]);

    const productCatalogMap = new Map<string, any>();

    // Index Business Koro catalog
    if (Array.isArray(bkProducts)) {
      for (const p of bkProducts) {
        if (p._id) productCatalogMap.set(String(p._id).toLowerCase(), p);
        if (p.slug) productCatalogMap.set(String(p.slug).toLowerCase(), p);
        if (p.businessKoroId) productCatalogMap.set(String(p.businessKoroId).toLowerCase(), p);
      }
    }

    // Index MongoDB catalog (takes precedence over BK defaults)
    if (Array.isArray(dbProducts)) {
      for (const p of dbProducts) {
        if (p._id) productCatalogMap.set(String(p._id).toLowerCase(), p);
        if (p.slug) productCatalogMap.set(String(p.slug).toLowerCase(), p);
        if (p.businessKoroId) productCatalogMap.set(String(p.businessKoroId).toLowerCase(), p);
      }
    }

    const offerMap = new Map<string, any>();
    if (Array.isArray(activeOffers)) {
      for (const o of activeOffers) {
        if (o.productId) offerMap.set(String(o.productId).toLowerCase(), o);
        if (o.productSlug) offerMap.set(String(o.productSlug).toLowerCase(), o);
      }
    }

    // 3. Server-Side Price Calculation & Verification
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const rawItem of items) {
      const pId = String(rawItem.productId || rawItem.id || rawItem.slug || '').trim().toLowerCase();
      const matchedProduct = productCatalogMap.get(pId);

      const quantity = Math.max(1, Math.min(50, parseInt(String(rawItem.quantity || 1), 10)));
      const activeOffer = offerMap.get(pId);

      let unitPrice: number;
      let itemName: string;
      let itemImage: string;
      let isOffer = false;
      let offerBadge = undefined;

      if (activeOffer) {
        unitPrice = Number(activeOffer.offerPrice);
        itemName = activeOffer.productName || matchedProduct?.name || rawItem.name || 'Flash Deal Item';
        itemImage = activeOffer.productImage || matchedProduct?.images?.[0] || rawItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
        isOffer = true;
        offerBadge = activeOffer.badgeText || '🔥 Flash Deal';
      } else if (matchedProduct) {
        unitPrice = Number(matchedProduct.price);
        itemName = matchedProduct.name;
        itemImage = matchedProduct.images?.[0] || rawItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
      } else {
        // Fallback: If product isn't in DB/BK catalog, enforce minimum bounds
        unitPrice = Math.max(100, Number(rawItem.price) || 999);
        itemName = String(rawItem.name || 'Luxury Product').substring(0, 100);
        itemImage = String(rawItem.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000');
      }

      calculatedSubtotal += unitPrice * quantity;

      verifiedItems.push({
        productId: rawItem.productId || rawItem.id || rawItem.slug || `prod_${Date.now()}`,
        name: itemName,
        price: unitPrice,
        quantity,
        image: itemImage,
        selectedColor: rawItem.selectedColor ? String(rawItem.selectedColor).substring(0, 50) : undefined,
        selectedSize: rawItem.selectedSize ? String(rawItem.selectedSize).substring(0, 50) : undefined,
        isOffer,
        offerBadge,
      });
    }

    // 4. Server-Side Coupon & Discount Calculation
    let calculatedDiscount = 0;
    const cleanCoupon = String(couponCode || '').toUpperCase().trim();
    if (cleanCoupon === 'HAVITALL20') {
      calculatedDiscount = Math.round(calculatedSubtotal * 0.20);
    } else if (cleanCoupon === 'LUXURY10') {
      calculatedDiscount = Math.round(calculatedSubtotal * 0.10);
    }

    // 5. Server-Side Shipping Calculation
    const isInsideDhaka = (customer.city || 'Dhaka').toLowerCase().includes('dhaka');
    let calculatedShipping = 0;
    if (calculatedSubtotal < FREE_SHIPPING_THRESHOLD) {
      calculatedShipping = isInsideDhaka ? 60 : 120;
    }

    // 6. Verified Final Total
    const calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedShipping);

    const orderNumber = `HAV-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email ? customer.email.trim() : undefined,
        phone: cleanPhone,
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'Dhaka',
        note: customer.note ? customer.note.trim() : '',
      },
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShipping,
      discount: calculatedDiscount,
      totalAmount: calculatedTotal,
      couponCode: cleanCoupon || undefined,
      paymentMethod: ['COD', 'BKASH', 'NAGAD', 'CARD'].includes(paymentMethod) ? paymentMethod : 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
      supplierStatus: 'Pending Approval',
      timeline: [
        {
          status: 'Placed',
          time: new Date(),
          note: `Order placed securely with ${paymentMethod}. Awaiting store admin confirmation & supplier dispatch. Subtotal: ৳${calculatedSubtotal}, Delivery: ৳${calculatedShipping}`,
        },
      ],
    };

    const order = await Order.create(orderData);

    return NextResponse.json({ success: true, order, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating order:', err.message);
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
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await Order.findByIdAndDelete(id);
    } else {
      await Order.findOneAndDelete({ $or: [{ orderNumber: id.toUpperCase() }, { _id: id }] });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting order:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
