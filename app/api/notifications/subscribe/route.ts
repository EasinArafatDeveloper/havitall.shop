import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import NotificationSubscriber from '@/lib/models/NotificationSubscriber';

function parseUserAgent(ua: string) {
  let browser = 'Chrome';
  let os = 'Windows';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  // Device type
  if (/mobile/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  return { browser, os, deviceType };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { permission, subscription } = body;

    const userAgent = request.headers.get('user-agent') || body.userAgent || 'Unknown Device';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const { browser, os, deviceType } = parseUserAgent(userAgent);
    const validPermission = ['granted', 'denied', 'default'].includes(permission) ? permission : 'default';

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 503 });
    }

    const endpoint = subscription?.endpoint || '';
    const keys = subscription?.keys || undefined;

    // Look for existing subscriber by endpoint OR (ip + userAgent)
    let filter: any = {};
    if (endpoint) {
      filter = { endpoint };
    } else {
      filter = { ip, userAgent: userAgent.slice(0, 120) };
    }

    const updated = await NotificationSubscriber.findOneAndUpdate(
      filter,
      {
        $set: {
          permission: validPermission,
          endpoint,
          keys,
          userAgent: userAgent.slice(0, 200),
          browser,
          os,
          deviceType,
          ip,
          lastActiveAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      subscriberId: updated._id,
      permission: updated.permission,
      browser: updated.browser,
      os: updated.os,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error saving notification permission:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
