import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order identifier is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id.toUpperCase().trim() }).lean();
    }

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching order:', err.message);
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
    const { orderStatus, note, paymentStatus } = body;
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const timelineEntry = {
      status: orderStatus || 'Updated',
      time: new Date(),
      note: note || `Order status updated to ${orderStatus || 'Updated'} by Admin`,
    };

    const updateData: Record<string, unknown> = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id.toUpperCase() };

    const updated = await Order.findOneAndUpdate(
      query,
      {
        $set: updateData,
        $push: { timeline: timelineEntry },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating order:', err.message);
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
