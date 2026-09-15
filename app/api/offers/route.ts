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
        return NextResponse.json({ success: true, offers: offers || [], source: 'mongodb' });
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
      offers: offers || [],
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

    const name = productName || 'Flash Deal Product';
    const image = productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
    const slug = productSlug || productId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const pId = productId || slug || `prod_${Date.now()}`;

    const origPrice = Number(originalPrice) || Number(offerPrice) || 1000;
    const offPrice = Number(offerPrice) || Number(originalPrice) || 1000;
    const discountPercentage = origPrice > offPrice
      ? Math.round(((origPrice - offPrice) / origPrice) * 100)
      : (body.discountPercentage || 0);

    const newOfferData = {
      productId: String(pId),
      productName: name,
      productImage: image,
      productSlug: slug,
      originalPrice: origPrice,
      offerPrice: offPrice,
      discountPercentage,
      title: title || `Special Flash Deal on ${name}`,
      subtitle: subtitle || 'Exclusive flash offer on our verified luxury collection.',
      badgeText: badgeText || '⚡ LIMITED FLASH DEAL',
      couponCode: (couponCode || 'HAVITALL20').toUpperCase().trim(),
      endDate: endDate || new Date(Date.now() + 86400000 * 2).toISOString(),
      isActive: Boolean(isActive),
      order: Number(order) || 1,
    };

    try {
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
    } catch (e) {
      console.warn('MongoDB create warning:', e);
    }

    // Memory Store fallback
    if (memoryStore) {
      if (newOfferData.isActive) {
        const activeMem = memoryStore.offers.filter((o) => o.isActive);
        if (activeMem.length >= 2) {
          activeMem[0].isActive = false;
        }
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
