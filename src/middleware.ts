import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Client-side auth guard handles redirect; middleware allows the request through
    // so Firebase Auth state can be checked in the admin layout.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
