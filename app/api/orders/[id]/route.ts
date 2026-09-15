import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { memoryStore } from '@/lib/memoryStore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();

    if (db) {
      let order = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id).lean();
      }
      if (!order) {
        order = await Order.findOne({ orderNumber: id.toUpperCase() }).lean();
      }
      if (order) {
        return NextResponse.json({ success: true, order, source: 'mongodb' });
      }
    }

    // Memory store fallback
    const memOrder = memoryStore?.orders.find(
      (o) => o._id === id || o.orderNumber?.toUpperCase() === id.toUpperCase()
    );

    if (!memOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: memOrder, source: 'memory' });
  } catch (error: any) {
    console.error('Error fetching order:', error);
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
    const { orderStatus, note, paymentStatus } = body;
    const db = await connectToDatabase();

    const timelineEntry = {
      status: orderStatus || 'Updated',
      time: new Date(),
      note: note || `Order status updated to ${orderStatus}`,
    };

    if (db) {
      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      let updated = null;
      const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id.toUpperCase() };

      updated = await Order.findOneAndUpdate(
        query,
        {
          $set: updateData,
          $push: { timeline: timelineEntry },
        },
        { new: true }
      ).lean();

      if (updated) {
        const memIdx = memoryStore?.orders.findIndex(
          (o) => o._id === id || o.orderNumber?.toUpperCase() === id.toUpperCase()
        );
        if (memIdx !== undefined && memIdx >= 0) {
          memoryStore!.orders[memIdx] = updated;
        }
        return NextResponse.json({ success: true, order: updated, source: 'mongodb' });
      }
    }

    // Memory update
    const memIdx = memoryStore?.orders.findIndex(
      (o) => o._id === id || o.orderNumber?.toUpperCase() === id.toUpperCase()
    );
    if (memIdx === undefined || memIdx === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (orderStatus) memoryStore!.orders[memIdx].orderStatus = orderStatus;
    if (paymentStatus) memoryStore!.orders[memIdx].paymentStatus = paymentStatus;
    if (!memoryStore!.orders[memIdx].timeline) {
      memoryStore!.orders[memIdx].timeline = [];
    }
    memoryStore!.orders[memIdx].timeline.push(timelineEntry);

    return NextResponse.json({
      success: true,
      order: memoryStore!.orders[memIdx],
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
