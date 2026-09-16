import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PushBroadcast from '@/lib/models/PushBroadcast';
import NotificationSubscriber from '@/lib/models/NotificationSubscriber';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latestOnly = searchParams.get('latestOnly') === 'true';

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    if (latestOnly) {
      const latest = await PushBroadcast.findOne().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, broadcast: latest });
    }

    const broadcasts = await PushBroadcast.find().sort({ createdAt: -1 }).limit(30).lean();
    return NextResponse.json({ success: true, broadcasts: broadcasts || [] });
  } catch (error: unknown) {
    const err = error as Error;
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
    const { title, message, icon, image, targetUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const grantedSubscribersCount = await NotificationSubscriber.countDocuments({ permission: 'granted' });

    const broadcast = await PushBroadcast.create({
      title: String(title).trim(),
      message: String(message).trim(),
      icon: icon ? String(icon).trim() : '/favicon.ico',
      image: image ? String(image).trim() : '',
      targetUrl: targetUrl ? String(targetUrl).trim() : '/shop',
      sentCount: grantedSubscribersCount,
      successCount: grantedSubscribersCount,
      status: 'sent',
    });

    return NextResponse.json({
      success: true,
      broadcast,
      recipientCount: grantedSubscribersCount,
      message: `Push notification broadcasted successfully to ${grantedSubscribersCount} subscribers!`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error broadcasting notification:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
