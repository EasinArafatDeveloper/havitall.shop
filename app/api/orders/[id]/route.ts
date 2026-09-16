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

import { pushOrderToBusinessKoro } from '@/lib/businessKoro';

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
    const { orderStatus, note, paymentStatus, action } = body;
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id.toUpperCase() };
    const existingOrder = await Order.findOne(query);

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // ========================================================
    // ACTION: APPROVE & FORWARD TO SUPPLIER (Business Koro)
    // ========================================================
    if (action === 'approve_and_forward') {
      const items = existingOrder.items || [];
      const customer = existingOrder.customer || {};
      const orderNumber = existingOrder.orderNumber;
      const cleanPhone = (customer.phone || '').replace(/[^0-9+]/g, '');

      let dispatchSuccess = false;
      let dispatchResults: any[] = [];
      let errorMessage = '';

      for (const item of items) {
        const bkPayload = {
          productId: String(item.productId),
          customerName: customer.fullName,
          customerPhone: cleanPhone,
          customerAddress: customer.address,
          customerDivision: customer.city || 'Dhaka',
          customerDistrict: customer.city || 'Dhaka',
          customerArea: customer.city || 'Dhaka',
          sellingPrice: item.price,
          deliveryChargePaidByCustomer: (existingOrder.shippingFee || 0) > 0,
          customerNote: customer.note || `HavItAll Order ${orderNumber}`,
        };

        const result = await pushOrderToBusinessKoro(bkPayload);
        dispatchResults.push(result);

        if (result.success) {
          dispatchSuccess = true;
        } else {
          errorMessage = result.error || 'Supplier API returned an error';
        }
      }

      const newSupplierStatus = dispatchSuccess ? 'Dispatched to Supplier' : 'Failed to Dispatch';
      const newOrderStatus = dispatchSuccess ? 'Confirmed' : existingOrder.orderStatus;
      const timelineNote = dispatchSuccess
        ? `✅ Order approved by Admin (${session.username || 'admin'}) and forwarded to Business Koro supplier for fulfillment.`
        : `⚠️ Admin attempted approval, but supplier dispatch encountered an issue: ${errorMessage}`;

      existingOrder.orderStatus = newOrderStatus;
      existingOrder.supplierStatus = newSupplierStatus;
      existingOrder.supplierResponse = dispatchResults;
      existingOrder.approvedAt = new Date();
      existingOrder.approvedBy = session.username || 'admin';
      existingOrder.timeline.push({
        status: newOrderStatus,
        time: new Date(),
        note: timelineNote,
      });

      await existingOrder.save();

      return NextResponse.json({
        success: true,
        order: existingOrder.toObject(),
        supplierDispatched: dispatchSuccess,
        message: dispatchSuccess
          ? 'Order approved and successfully forwarded to Business Koro supplier!'
          : `Order marked, but supplier dispatch notice: ${errorMessage}`,
      });
    }

    // ========================================================
    // STANDARD STATUS / NOTE UPDATE
    // ========================================================
    const timelineEntry = {
      status: orderStatus || 'Updated',
      time: new Date(),
      note: note || `Order status updated to ${orderStatus || 'Updated'} by Admin`,
    };

    const updateData: Record<string, unknown> = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (body.supplierStatus) updateData.supplierStatus = body.supplierStatus;

    const updated = await Order.findOneAndUpdate(
      query,
      {
        $set: updateData,
        $push: { timeline: timelineEntry },
      },
      { new: true }
    ).lean();

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
