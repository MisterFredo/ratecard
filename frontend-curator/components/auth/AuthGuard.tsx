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

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [user, loading, pathname, isPublic]);

  // --------------------------------------------------
  // ⏳ LOADING
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Chargement…
      </div>
    );
  }

  // --------------------------------------------------
  // 🔓 PUBLIC
  // --------------------------------------------------
  if (isPublic) return <>{children}</>;

  // --------------------------------------------------
  // 🔒 NOT AUTH
  // --------------------------------------------------
  if (!user) return null;

  // --------------------------------------------------
  // ✅ AUTH
  // --------------------------------------------------
  return <>{children}</>;
}
