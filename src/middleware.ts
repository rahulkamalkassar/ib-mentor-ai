export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
