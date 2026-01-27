import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = req.nextUrl.pathname.startsWith("/admin")
    
    // 管理者ページへのアクセス制御
    if (isAdmin && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/spells/:path*",
    "/items/:path*",
    "/skills/:path*",
    "/abilities/:path*",
    "/admin/:path*",
  ],
}
