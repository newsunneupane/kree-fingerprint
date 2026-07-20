import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/employee', '/admin']
const publicRoutes = ['/login']

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  const sessionCookie = request.cookies.get('session')?.value
  const session = sessionCookie ? await decrypt(sessionCookie) : null

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && session?.userId && !path.startsWith('/login')) {
    const role = session.role as string
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  if (path === '/') {
    if (session?.userId) {
      const role = session.role as string
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.redirect(new URL('/employee', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
