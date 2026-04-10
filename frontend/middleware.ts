import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔓 Autoriser login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 🔐 Protéger /admin
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("curator_session");

    if (!session?.value) {
      return redirectToLogin(request);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${session.value}`
      );

      if (!res.ok) {
        throw new Error("User fetch failed");
      }

      const data = await res.json();
      const user = data?.user;

      // ❌ user invalide
      if (!user || !user.IS_ACTIVE) {
        throw new Error("Invalid user");
      }

      // ❌ pas admin
      if (user.ROLE !== "admin") {
        throw new Error("Not admin");
      }

      // ✅ accès OK
      return NextResponse.next();

    } catch (e) {
      console.error("Middleware auth error:", e);
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

/* =======================================================
   REDIRECT LOGIN
======================================================= */

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
