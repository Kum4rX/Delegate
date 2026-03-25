import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/chat', '/permissions', '/api/chat', '/api/token', '/api/stepup', '/api/permissions']

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = req.cookies.get('appSession')
  if (!session) {
    const loginUrl = new URL('/api/auth/login', req.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat', '/permissions', '/api/chat', '/api/token', '/api/stepup', '/api/permissions'],
}
