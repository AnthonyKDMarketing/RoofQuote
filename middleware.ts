import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const ADMIN_PATHS = ['/admin'];
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/signup', '/admin/forgot-password', '/admin/reset-password'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith('/admin');
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isAdminPath && !isPublicAdminPath) {
    const token = req.cookies.get('rq_session')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    const session = await verifySession(token);
    if (!session) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('rq_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
