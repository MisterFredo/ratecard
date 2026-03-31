import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --------------------------------------------------
  // 🟢 ROUTES PUBLIQUES
  // --------------------------------------------------
  if (
    pathname === "/" ||              // 👉 HOME publique
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("curator_session");

  // --------------------------------------------------
  // 🔒 PROTECTION
  // --------------------------------------------------
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
