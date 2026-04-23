"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  name: string;

  // logo final (solution OU fallback company)
  visualRectId?: string | null;

  // source du logo
  visualType?: "solution" | "company";

  nbAnalyses?: number;
  delta30d?: number;
  isPartner?: boolean;

  hasNumbers?: boolean;

  lastRadar?: {
    id_insight: string;
    key_points: string[];
  };
};

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function SolutionCard({
  id,
  name,
  visualRectId,
  visualType,
  nbAnalyses,
  delta30d,
  isPartner,
  hasNumbers,
  lastRadar,
}: Props) {

  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer, openRightDrawer } = useDrawer();

  // =====================================================
  // 🔥 VISUAL URL (SAFE + ROBUST)
  // =====================================================
  let visualUrl: string | null = null;

  if (visualRectId) {
    const folder =
      visualType === "solution"
        ? "solutions"
        : "companies"; // fallback par défaut

    visualUrl = `${GCS_BASE_URL}/${folder}/${visualRectId}`;
  }

  // =====================================================
  // HANDLERS
  // =====================================================
  function handleClick() {
    openLeftDrawer("solution", id);

    router.replace(
      `${pathname}?solution_id=${id}`,
      { scroll: false }
    );
  }

  function handleRadarClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (lastRadar?.id_insight) {
      openRightDrawer("radar", lastRadar.id_insight);
    }
  }

  // =====================================================
  // UI
  // =====================================================
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
      {/* BADGE NUMBERS */}
      {hasNumbers && (
        <div className="
          absolute top-2 left-2 z-10
          text-[10px] px-2 py-0.5 rounded
          bg-blue-50 text-blue-600
          border border-blue-100
        ">
          #
        </div>
      )}

      {/* BADGES */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {isPartner && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-teal-600 text-white">
            Partner
          </span>
        )}

        {typeof delta30d === "number" && delta30d > 0 && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-orange-100 text-orange-600">
            +{delta30d}
          </span>
        )}
      </div>

      {/* VISUEL */}
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

        {/* RADAR OVERLAY */}
        {lastRadar?.key_points?.[0] && (
          <div
            onClick={handleRadarClick}
            className="
              absolute inset-0
              bg-black/0 group-hover:bg-black/60
              transition duration-200
              flex items-end p-3
              opacity-0 group-hover:opacity-100
            "
          >
            <p className="
              text-[11px] text-white leading-snug line-clamp-3
            ">
              {lastRadar.key_points[0]}
            </p>
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-3 space-y-1 text-center">
        <h3 className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:underline">
          {name}
        </h3>

        {typeof nbAnalyses === "number" && (
          <p className="text-[10px] text-gray-400">
            {nbAnalyses} analyses
          </p>
        )}

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
