import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔓 Autoriser la page de login admin
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 🔐 Protéger tout le reste de /admin
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("ratecard_admin_session");

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
