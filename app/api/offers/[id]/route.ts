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
    const existingOffer = await Offer.findOne(query).lean();
    const offerType = body.offerType || existingOffer?.offerType;
    const excludeId = existingOffer?._id || query._id || id;

    if (offerType === 'top_bar' && body.isActive === true) {
      await Offer.updateMany(
        { offerType: 'top_bar', _id: { $ne: excludeId } },
        { $set: { isActive: false } }
      );
    } else if (offerType === 'popup_poster' && body.isActive === true) {
      // Only one popup poster should be live at a time
      await Offer.updateMany(
        { offerType: 'popup_poster', _id: { $ne: excludeId } },
        { $set: { isActive: false } }
      );
    } else if (offerType === 'flash_deal' && body.isActive === true) {
      // Keep max 2 active flash deals on homepage, same rule as creating a new one
      const activeDeals = await Offer.find({
        offerType: 'flash_deal',
        isActive: true,
        _id: { $ne: excludeId },
      }).sort({ updatedAt: 1 });
      if (activeDeals.length >= 2) {
        const toDeactivate = activeDeals.slice(0, activeDeals.length - 1);
        await Offer.updateMany(
          { _id: { $in: toDeactivate.map((o) => o._id) } },
          { $set: { isActive: false } }
        );
      }
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
