import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME, TOKEN_EXPIRY_MS } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import LoginAttempt from '@/lib/models/LoginAttempt';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const db = await connectToDatabase();

    if (db) {
      const existing = await LoginAttempt.findOne({ ip });
      if (existing?.lockedUntil && existing.lockedUntil.getTime() > Date.now()) {
        const minutesLeft = Math.ceil((existing.lockedUntil.getTime() - Date.now()) / 60000);
        return NextResponse.json(
          { success: false, error: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` },
          { status: 429 }
        );
      }
    }

    const isValid = verifyAdminCredentials(String(username), String(password));
    if (!isValid) {
      if (db) {
        const existing = await LoginAttempt.findOne({ ip });
        const failedCount = (existing?.failedCount || 0) + 1;
        const lockedUntil = failedCount >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : undefined;
        await LoginAttempt.findOneAndUpdate(
          { ip },
          { failedCount: lockedUntil ? 0 : failedCount, lockedUntil },
          { upsert: true }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Invalid admin username or password.' },
        { status: 401 }
      );
    }

    if (db) {
      await LoginAttempt.findOneAndUpdate({ ip }, { failedCount: 0, lockedUntil: null }, { upsert: true });
    }

    const token = createAdminToken(username);
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful.',
      username: username.toLowerCase(),
    });

    const isProd = process.env.NODE_ENV === 'production';

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
    });

    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Admin login error:', err.message);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
