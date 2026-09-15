import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { memoryStore } from '@/lib/memoryStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    try {
      const db = await connectToDatabase();
      if (db) {
        const filter = activeOnly ? { isActive: true } : {};
        const offers = await Offer.find(filter).sort({ order: 1, createdAt: -1 }).lean();
        if (offers && offers.length > 0) {
          return NextResponse.json({ success: true, offers, source: 'mongodb' });
        }
      }
    } catch (e) {
      console.warn('MongoDB query warning for offers:', e);
    }

    let offers = memoryStore?.offers || [];
    if (activeOnly) {
      offers = offers.filter((o) => o.isActive);
    }

    return NextResponse.json({
      success: true,
      offers,
      source: 'memory',
    });
  } catch (error: any) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      productImage,
      productSlug,
      originalPrice,
      offerPrice,
      title,
      subtitle,
      badgeText,
      couponCode,
      endDate,
      isActive = true,
      order = 1,
    } = body;

    if (!productId || !productName || !productImage) {
      return NextResponse.json(
        { success: false, error: 'Product ID, Name, and Image are required to create a flash offer.' },
        { status: 400 }
      );
    }

    const origPrice = Number(originalPrice) || Number(offerPrice) || 1000;
    const offPrice = Number(offerPrice) || Number(originalPrice) || 1000;
    const discountPercentage = origPrice > offPrice
      ? Math.round(((origPrice - offPrice) / origPrice) * 100)
      : (body.discountPercentage || 0);

    const newOfferData = {
      productId,
      productName,
      productImage,
      productSlug: productSlug || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      originalPrice: origPrice,
      offerPrice: offPrice,
      discountPercentage,
      title: title || 'Limited Flash Deal',
      subtitle: subtitle || 'Exclusive flash offer on our verified luxury collection.',
      badgeText: badgeText || '⚡ LIMITED FLASH DEAL',
      couponCode: couponCode || 'HAVITALL20',
      endDate: endDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      isActive: Boolean(isActive),
      order: Number(order) || 1,
    };

    const db = await connectToDatabase();
    if (db) {
      // If new offer is active, ensure we don't have more than 2 active offers
      if (newOfferData.isActive) {
        const activeOffers = await Offer.find({ isActive: true }).sort({ updatedAt: 1 });
        if (activeOffers.length >= 2) {
          // Deactivate the oldest active offer to keep max 2 active
          await Offer.findByIdAndUpdate(activeOffers[0]._id, { isActive: false });
        }
      }

      const offer = await Offer.create(newOfferData);
      
      // Update memory store
      if (memoryStore) {
        if (newOfferData.isActive) {
          const activeMem = memoryStore.offers.filter((o) => o.isActive);
          if (activeMem.length >= 2) {
            activeMem[0].isActive = false;
          }
        }
        memoryStore.offers.unshift(offer.toObject());
      }

      return NextResponse.json({ success: true, offer, source: 'mongodb' });
    }

    // Memory Store fallback
    if (newOfferData.isActive && memoryStore) {
      const activeMem = memoryStore.offers.filter((o) => o.isActive);
      if (activeMem.length >= 2) {
        activeMem[0].isActive = false;
      }
    }

    const memOffer = {
      ...newOfferData,
      _id: `offer_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (memoryStore) {
      memoryStore.offers.unshift(memOffer);
    }

    return NextResponse.json({ success: true, offer: memOffer, source: 'memory' });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
