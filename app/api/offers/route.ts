import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const popupOnly = searchParams.get('popupOnly') === 'true';
    const dealOnly = searchParams.get('dealOnly') === 'true';
    const topBarOnly = searchParams.get('topBarOnly') === 'true';
    const type = searchParams.get('type');

    const db = await connectToDatabase();
    if (db) {
      const filter: any = {};
      if (activeOnly || popupOnly || dealOnly || topBarOnly) filter.isActive = true;

      if (popupOnly) {
        filter.offerType = 'popup_poster';
      } else if (dealOnly) {
        filter.$or = [
          { offerType: 'flash_deal' },
          { offerType: { $exists: false } },
        ];
      } else if (topBarOnly) {
        filter.offerType = 'top_bar';
      } else if (type) {
        filter.offerType = type;
      }

      const offers = await Offer.find(filter).sort({ order: 1, updatedAt: -1, createdAt: -1 }).lean();
      return NextResponse.json({ success: true, offers: offers || [], source: 'mongodb' });
    }

    return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching offers:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const offerType = body.offerType || (body.posterImage && !body.productId ? 'popup_poster' : 'flash_deal');

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    let newOfferData: any;

    if (offerType === 'top_bar') {
      // Top Announcement Bar
      const topBarText = body.topBarText !== undefined ? String(body.topBarText).trim() : 'Grand Launch: Use code';
      const topBarHighlight = body.topBarHighlight !== undefined ? String(body.topBarHighlight).trim() : 'HAVITALL20 for 20% OFF';
      const topBarSuffix = body.topBarSuffix !== undefined ? String(body.topBarSuffix).trim() : '| Free Shipping over ৳1,500';
      const topBarLink = body.topBarLink ? String(body.topBarLink).trim() : '/shop';
      const topBarTheme = body.topBarTheme || 'dark_gold';
      const topBarIcon = body.topBarIcon || 'sparkles';
      const title = body.title ? String(body.title).trim() : (topBarHighlight ? `${topBarText} ${topBarHighlight}` : 'Top Announcement Bar');

      newOfferData = {
        offerType: 'top_bar',
        title,
        topBarText,
        topBarHighlight,
        topBarSuffix,
        topBarLink,
        topBarTheme,
        topBarIcon,
        isActive: Boolean(body.isActive !== false),
        order: Number(body.order) || 1,
      };

      // Keep only one top_bar active at a time if this one is active
      if (newOfferData.isActive) {
        await Offer.updateMany(
          { offerType: 'top_bar' },
          { $set: { isActive: false } }
        );
      }
    } else if (offerType === 'popup_poster') {
      const poster = body.posterImage ? String(body.posterImage).trim() : '';
      if (!poster) {
        return NextResponse.json({ success: false, error: 'Poster image is required for popup poster.' }, { status: 400 });
      }

      newOfferData = {
        offerType: 'popup_poster',
        title: body.title ? String(body.title).trim() : 'Promotional Popup Poster',
        posterImage: poster,
        targetUrl: body.targetUrl ? String(body.targetUrl).trim() : '/shop',
        isActive: Boolean(body.isActive !== false),
        showAsPopup: true,
        popupDelaySeconds: Number(body.popupDelaySeconds) || 1,
        order: Number(body.order) || 1,
      };
    } else {
      // Flash Deal Card on Homepage
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

      const name = productName ? String(productName).trim() : 'Flash Deal Product';
      const image = productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
      const slug = productSlug || productId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const pId = productId || slug || `prod_${Date.now()}`;

      const origPrice = Number(originalPrice) || Number(offerPrice) || 1000;
      const offPrice = Number(offerPrice) || Number(originalPrice) || 1000;
      const discountPercentage = origPrice > offPrice && origPrice > 0
        ? Math.round(((origPrice - offPrice) / origPrice) * 100)
        : (Number(body.discountPercentage) || 0);

      newOfferData = {
        offerType: 'flash_deal',
        productId: String(pId),
        productName: name,
        productImage: image,
        productSlug: String(slug),
        targetUrl: `/product/${slug}`,
        posterImage: image,
        originalPrice: origPrice,
        offerPrice: offPrice,
        discountPercentage,
        title: title ? String(title).trim() : `Special Flash Deal on ${name}`,
        subtitle: subtitle ? String(subtitle).trim() : 'Exclusive flash offer on our verified luxury collection.',
        badgeText: badgeText ? String(badgeText).trim() : '⚡ LIMITED FLASH DEAL',
        couponCode: (couponCode || 'HAVITALL20').toUpperCase().trim(),
        endDate: endDate || new Date(Date.now() + 86400000 * 2).toISOString(),
        isActive: Boolean(isActive),
        showAsPopup: false,
        order: Number(order) || 1,
      };

      // Keep max 2 active flash deals on homepage
      if (newOfferData.isActive) {
        const activeDeals = await Offer.find({ offerType: 'flash_deal', isActive: true }).sort({ updatedAt: 1 });
        if (activeDeals.length >= 2) {
          const toDeactivate = activeDeals.slice(0, activeDeals.length - 1);
          await Offer.updateMany(
            { _id: { $in: toDeactivate.map((o) => o._id) } },
            { $set: { isActive: false } }
          );
        }
      }
    }

    const offer = await Offer.create(newOfferData);
    return NextResponse.json({ success: true, offer, source: 'mongodb' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating offer:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { _id, id } = body;
    const targetId = _id || id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Offer ID is required for update' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    // If activating a top_bar offer, deactivate others
    if (body.offerType === 'top_bar' && body.isActive === true) {
      await Offer.updateMany(
        { offerType: 'top_bar', _id: { $ne: targetId } },
        { $set: { isActive: false } }
      );
    }

    const updated = await Offer.findByIdAndUpdate(
      targetId,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer: updated });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating offer:', err.message);
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
      return NextResponse.json({ success: false, error: 'Offer ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await Offer.findByIdAndDelete(id);
    } else {
      await Offer.findOneAndDelete({ $or: [{ _id: id }, { productId: id }] });
    }

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting offer:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
