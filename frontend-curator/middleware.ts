import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --------------------------------------------------
  // 🟢 ROUTES PUBLIQUES + ASSETS
  // --------------------------------------------------
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 🔐 SESSION
  // --------------------------------------------------
  const session =
    request.cookies.get("curator_session")?.value === "ok";

  const userId =
    request.cookies.get("curator_user_id")?.value;

  // --------------------------------------------------
  // 🔒 PROTECTION
  // --------------------------------------------------
  if (!session || !userId) {
    const loginUrl = new URL("/login", request.url);

    // 🔥 conserve redirect complet
    loginUrl.searchParams.set(
      "redirect",
      pathname + search
    );

    return NextResponse.redirect(loginUrl);
  }

  // --------------------------------------------------
  // ✅ PASS
  // --------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
