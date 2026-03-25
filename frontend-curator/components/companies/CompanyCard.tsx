"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  id: string;
  name: string;
  visualRectId?: string | null;

  totalAnalyses?: number;
  totalNews?: number; // ✅ NEW

  delta30d?: number;

  lastRadar?: {
    id_insight: string;
    key_points: string[];
  };
};

export default function CompanyCard({
  id,
  name,
  visualRectId,
  totalAnalyses,
  totalNews,
  delta30d,
  lastRadar,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer, openRightDrawer } = useDrawer();

  const visualUrl = visualRectId
    ? `${GCS_BASE_URL}/companies/${visualRectId}`
    : null;

  // ✅ total contenu (analyses + news)
  const totalContent =
    (totalAnalyses ?? 0) + (totalNews ?? 0);

  function handleClick() {
    openLeftDrawer("company", id);

    router.replace(
      `${pathname}?company_id=${id}`,
      { scroll: false }
    );
  }

  function handleRadarClick(e: React.MouseEvent) {
    e.stopPropagation();
    openRightDrawer("radar", lastRadar!.id_insight);
  }

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer rounded-xl
        border border-ratecard-border
        bg-white shadow-card transition
        hover:shadow-cardHover overflow-hidden
        relative
      "
    >
      {/* =====================================================
          BADGE TREND
      ===================================================== */}
      {typeof delta30d === "number" && delta30d > 0 && (
        <div className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded bg-green-100 text-green-600 z-10">
          +{delta30d}
        </div>
      )}

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
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            {name}
          </div>
        )}

        {/* =====================================================
            RADAR OVERLAY
        ===================================================== */}
        {lastRadar?.key_points?.[0] && (
          <div
            onClick={handleRadarClick}
            className="
              absolute inset-0
              bg-black/0 group-hover:bg-black/50
              transition duration-200
              flex items-end p-3
              opacity-0 group-hover:opacity-100
            "
          >
            <p className="text-[11px] text-white leading-snug line-clamp-3">
              {lastRadar.key_points[0]}
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="p-3 space-y-1 text-center">
        <h3 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:underline">
          {name}
        </h3>

        {(typeof totalAnalyses === "number" ||
          typeof totalNews === "number" ||
          typeof delta30d === "number") && (
          <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
            {/* ✅ TOTAL CONTENT */}
            {(typeof totalAnalyses === "number" ||
              typeof totalNews === "number") && (
              <span>{totalContent}</span>
            )}

            {/* ✅ DELTA */}
            {typeof delta30d === "number" &&
              delta30d > 0 && (
                <span className="text-green-600">
                  +{delta30d}
                </span>
              )}
          </div>
        )}

        {/* CTA radar */}
        {lastRadar && (
          <div
            onClick={handleRadarClick}
            className="
              text-[10px] text-gray-400
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            Voir la veille →
          </div>
        )}
      </div>
    </div>
  );
}
