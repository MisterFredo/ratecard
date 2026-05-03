"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useUser();

  // --------------------------------------------------
  // 🔐 ROUTES PUBLIQUES
  // --------------------------------------------------
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login");

  // --------------------------------------------------
  // 🔁 REDIRECT
  // --------------------------------------------------
  useEffect(() => {
    if (!loading && !user && !isPublic) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [user, loading, pathname, isPublic, router]);

  // --------------------------------------------------
  // ⏳ LOADING → 🔥 FIX ICI
  // --------------------------------------------------
  if (loading) {
    return (
      <>
        {children}
        <div className="fixed bottom-4 right-4 text-xs text-gray-400">
          Chargement…
        </div>
      </>
    );
  }

  // --------------------------------------------------
  // 🔓 PUBLIC
  // --------------------------------------------------
  if (isPublic) {
    return <>{children}</>;
  }

  // --------------------------------------------------
  // 🔒 NOT AUTH
  // --------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Redirection…
      </div>
    );
  }

  // --------------------------------------------------
  // ✅ AUTH
  // --------------------------------------------------
  return <>{children}</>;
}
