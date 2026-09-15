import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      if (orders && orders.length > 0) {
        return NextResponse.json({ success: true, orders, source: 'mongodb' });
      }
    }

    return NextResponse.json({
      success: true,
      orders: memoryStore?.orders || [],
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items, totalAmount } = body;

    if (!customer?.fullName || !customer?.phone || !customer?.address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, address, and at least one item are required.' },
        { status: 400 }
      );
    }

    const orderNumber = `HAV-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData = {
      orderNumber,
      customer: {
        fullName: customer.fullName,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
        city: customer.city || 'Dhaka',
        note: customer.note || '',
      },
      items: items.map((it: any) => ({
        productId: it.productId || it.id || it.slug,
        name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity || 1),
        image: it.image || it.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
        selectedColor: it.selectedColor,
        selectedSize: it.selectedSize,
      })),
      subtotal: Number(body.subtotal || totalAmount),
      shippingFee: Number(body.shippingFee || 0),
      discount: Number(body.discount || 0),
      totalAmount: Number(totalAmount),
      couponCode: body.couponCode || '',
      paymentMethod: body.paymentMethod || 'COD',
      paymentStatus: body.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Placed',
      timeline: [
        {
          status: 'Placed',
          time: new Date(),
          note: `Order received via website with payment method: ${body.paymentMethod || 'COD'}`,
        },
      ],
    };

    const db = await connectToDatabase();
    if (db) {
      const order = await Order.create(orderData);
      memoryStore?.orders.unshift(order.toObject());
      return NextResponse.json({ success: true, order, source: 'mongodb' });
    }

    const memOrder = {
      ...orderData,
      _id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore?.orders.unshift(memOrder);

    return NextResponse.json({ success: true, order: memOrder, source: 'memory' });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
