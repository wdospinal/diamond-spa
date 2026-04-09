import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function adminAppHostname(hostname: string) {
  const base = hostname.split(':')[0]
  return base === 'app.diamondspa.com.co' || base === 'app.localhost'
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]

  if (!adminAppHostname(hostname)) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Already under /admin (e.g. user opened /admin/login on the app host) — do not prefix again or we hit /admin/admin/... → 404.
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
