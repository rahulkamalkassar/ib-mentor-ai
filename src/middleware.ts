export { auth as middleware } from '@/auth'

export const config = {
  // Only protect the app routes — landing, login, onboarding, and all API routes are public
  matcher: ['/dashboard/:path*', '/calendar/:path*', '/subjects/:path*', '/grades/:path*', '/study-plan/:path*', '/practice-tests/:path*', '/past-papers/:path*', '/ee-helper/:path*', '/tok-teacher/:path*', '/uni-counsellor/:path*', '/settings/:path*', '/upgrade/:path*'],
}
