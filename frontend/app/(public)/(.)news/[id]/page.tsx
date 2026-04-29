"use client";

import { Suspense } from "react";
import NewsDrawer from "@/components/drawers/NewsDrawer";

/* =========================================================
   LOADING FALLBACK (immédiat)
========================================================= */

function LoadingFallback() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <p className="text-sm text-gray-500">
        Chargement de la news…
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function NewsInterceptPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewsDrawer id={params.id} />
    </Suspense>
  );
}
