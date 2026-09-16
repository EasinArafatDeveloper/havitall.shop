import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'havitall_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware for /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isLoginPage = pathname === '/admin/login';

    // Simple structural token check in Edge middleware; full crypto verification happens in API endpoints
    const hasToken = Boolean(token && token.includes('.') && token.length > 20);

    if (!hasToken && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (hasToken && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
