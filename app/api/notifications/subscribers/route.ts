import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import NotificationSubscriber from '@/lib/models/NotificationSubscriber';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = verifyAdminSession(request);
  if (!session.authenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('filter'); // 'all', 'granted', 'denied'
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const query: any = {};
    if (filterType && filterType !== 'all') {
      query.permission = filterType;
    }

    const [subscribers, totalCount, grantedCount, deniedCount, desktopCount, mobileCount] = await Promise.all([
      NotificationSubscriber.find(query).sort({ updatedAt: -1, createdAt: -1 }).limit(limit).lean(),
      NotificationSubscriber.countDocuments(),
      NotificationSubscriber.countDocuments({ permission: 'granted' }),
      NotificationSubscriber.countDocuments({ permission: 'denied' }),
      NotificationSubscriber.countDocuments({ permission: 'granted', deviceType: 'desktop' }),
      NotificationSubscriber.countDocuments({ permission: 'granted', deviceType: 'mobile' }),
    ]);

    const grantRate = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;

    return NextResponse.json({
      success: true,
      subscribers: subscribers || [],
      stats: {
        total: totalCount,
        granted: grantedCount,
        denied: deniedCount,
        grantRate,
        desktopGranted: desktopCount,
        mobileGranted: mobileCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching subscribers:', err.message);
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

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (id === 'all_denied') {
      await NotificationSubscriber.deleteMany({ permission: 'denied' });
      return NextResponse.json({ success: true, message: 'All denied subscribers cleared' });
    }

    if (id) {
      await NotificationSubscriber.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Subscriber deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Subscriber ID required' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
