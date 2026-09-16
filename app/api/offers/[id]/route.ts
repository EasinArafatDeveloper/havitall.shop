import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };
    const offer = await Offer.findOne(query).lean();

    if (!offer) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
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
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (body.originalPrice !== undefined && body.offerPrice !== undefined) {
      const orig = Number(body.originalPrice);
      const off = Number(body.offerPrice);
      if (orig > off && orig > 0) {
        body.discountPercentage = Math.round(((orig - off) / orig) * 100);
      }
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };

    if (body.offerType === 'top_bar' && body.isActive === true) {
      await Offer.updateMany(
        { offerType: 'top_bar', _id: { $ne: query._id || id } },
        { $set: { isActive: false } }
      );
    }

    const updated = await Offer.findOneAndUpdate(
      query,
      { $set: body },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer: updated, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
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

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { productId: id };
    await Offer.findOneAndDelete(query);

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
