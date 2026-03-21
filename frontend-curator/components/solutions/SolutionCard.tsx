"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  name: string;
  visualRectId?: string | null; // 🔥 futur (fallback company)
  nbAnalyses?: number;
};

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function SolutionCard({
  id,
  name,
  visualRectId,
  nbAnalyses,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer } = useDrawer();

  const visualUrl = visualRectId
    ? `${GCS_BASE_URL}/companies/${visualRectId}`
    : null;

  function handleClick() {
    // 1️⃣ ouverture drawer
    openLeftDrawer("solution", id);

    // 2️⃣ synchro URL
    router.replace(
      `${pathname}?solution_id=${id}`,
      { scroll: false }
    );
  }

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer rounded-xl
        border border-ratecard-border
        bg-white shadow-card transition
        hover:shadow-cardHover overflow-hidden
      "
    >
      {/* =====================================================
          VISUEL
      ===================================================== */}
      <div className="relative h-24 w-full bg-ratecard-light overflow-hidden">
        {visualUrl ? (
          <img
            src={visualUrl}
            alt={name}
            className="
              h-full w-full object-contain
              p-4 transition-transform duration-300
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 px-2 text-center">
            {name}
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENU
      ===================================================== */}
      <div className="p-3 space-y-1 text-center">
        <h3 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:underline">
          {name}
        </h3>

        {typeof nbAnalyses === "number" && (
          <p className="text-[10px] text-gray-400">
            {nbAnalyses} analyses
          </p>
        )}
      </div>
    </div>
  );
}
