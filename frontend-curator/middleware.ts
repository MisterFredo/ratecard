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
  // ⚠️ JWT MODE (NO COOKIE ACCESS)
  // --------------------------------------------------
  // Le middleware n’a pas accès au localStorage
  // → impossible de vérifier le token ici

  // --------------------------------------------------
  // 🔁 REDIRECT LOGIQUE UNIQUEMENT
  // --------------------------------------------------
  // On laisse passer et la protection se fait côté client
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
