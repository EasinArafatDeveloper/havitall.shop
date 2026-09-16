import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME, TOKEN_EXPIRY_MS } from '@/lib/auth';

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

    const isValid = verifyAdminCredentials(String(username), String(password));
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin username or password.' },
        { status: 401 }
      );
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
