import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { memoryStore } from '@/lib/memoryStore';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = await connectToDatabase();
    if (db) {
      const offer = await Offer.findById(id).lean();
      if (offer) {
        return NextResponse.json({ success: true, offer });
      }
    }

    const memOffer = memoryStore?.offers.find((o) => o._id === id || o.productId === id);
    if (memOffer) {
      return NextResponse.json({ success: true, offer: memOffer });
    }

    return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
  } catch (error: any) {
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
    if (db) {
      // If toggling active to true, check active count
      if (body.isActive === true) {
        const activeOffers = await Offer.find({ isActive: true, _id: { $ne: id } }).sort({ updatedAt: 1 });
        if (activeOffers.length >= 2) {
          // Deactivate the oldest one
          await Offer.findByIdAndUpdate(activeOffers[0]._id, { isActive: false });
        }
      }

      const updated = await Offer.findByIdAndUpdate(id, body, { new: true });
      if (updated) {
        // Also update memoryStore
        if (memoryStore) {
          const idx = memoryStore.offers.findIndex((o) => o._id === id);
          if (idx !== -1) {
            memoryStore.offers[idx] = updated.toObject();
          }
        }
        return NextResponse.json({ success: true, offer: updated });
      }
    }

    // Memory Store update
    if (memoryStore) {
      if (body.isActive === true) {
        const activeMem = memoryStore.offers.filter((o) => o.isActive && o._id !== id);
        if (activeMem.length >= 2) {
          activeMem[0].isActive = false;
        }
      }

      const idx = memoryStore.offers.findIndex((o) => o._id === id);
      if (idx !== -1) {
        memoryStore.offers[idx] = { ...memoryStore.offers[idx], ...body, updatedAt: new Date().toISOString() };
        return NextResponse.json({ success: true, offer: memoryStore.offers[idx] });
      }
    }

    return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
  } catch (error: any) {
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
      await Offer.findByIdAndDelete(id);
    }

    if (memoryStore) {
      memoryStore.offers = memoryStore.offers.filter((o) => o._id !== id);
    }

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
