import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const userRaw = request.cookies.get('user')?.value || '';
  let user = null;

  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';

  if (!isAdmin) {
    const redirectUrl = new URL('/forbidden', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
