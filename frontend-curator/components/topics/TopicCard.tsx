"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  label: string;

  nbAnalyses?: number;
  delta30d?: number;

  lastRadar?: {
    id_insight: string;
    key_points: string[];
  };
};

export default function TopicCard({
  id,
  label,
  nbAnalyses,
  delta30d,
  lastRadar,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer, openRightDrawer } = useDrawer();

  function handleClick() {
    openLeftDrawer("topic", id);

    router.replace(
      `${pathname}?topic_id=${id}`,
      { scroll: false }
    );
  }

  function handleRadarClick(e: React.MouseEvent) {
    e.stopPropagation();
    openRightDrawer("radar", lastRadar!.id_insight);
  }

  const isTrending =
    typeof delta30d === "number" && delta30d > 0;

  const intensity =
    typeof nbAnalyses === "number"
      ? Math.min(nbAnalyses * 2, 100)
      : 0;

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer relative
        rounded-2xl border border-gray-200 bg-white
        p-4
        transition-all duration-200
        hover:shadow-md hover:border-gray-300 hover:-translate-y-[2px]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between mb-2">
        {typeof nbAnalyses === "number" && (
          <span className="text-[11px] text-gray-400">
            {nbAnalyses} analyses
          </span>
        )}

        {isTrending && (
          <span className="
            text-[10px] px-2 py-0.5 rounded-full
            bg-orange-100 text-orange-600 font-medium
          ">
            +{delta30d}
          </span>
        )}
      </div>

      {/* =====================================================
          LABEL
      ===================================================== */}
      <h3 className="
        text-sm font-semibold text-gray-900 leading-snug
        group-hover:text-black
      ">
        {label}
      </h3>

      {/* =====================================================
          RADAR PREVIEW (🔥 KEY FEATURE)
      ===================================================== */}
      {lastRadar?.key_points?.[0] && (
        <div
          onClick={handleRadarClick}
          className="
            mt-3 text-[12px] text-gray-600
            line-clamp-2
            group-hover:text-gray-800
            transition
          "
        >
          {lastRadar.key_points[0]}
        </div>
      )}

      {/* =====================================================
          CTA RADAR
      ===================================================== */}
      {lastRadar && (
        <div
          onClick={handleRadarClick}
          className="
            mt-2 text-[11px] text-gray-400
            opacity-0 group-hover:opacity-100
            transition
          "
        >
          Voir la veille →
        </div>
      )}

      {/* =====================================================
          BAR
      ===================================================== */}
      {typeof nbAnalyses === "number" && (
        <div className="mt-4 h-[3px] w-full bg-gray-100 rounded overflow-hidden">
          <div
            className="
              h-full bg-gray-900
              transition-all duration-300
              group-hover:bg-teal-600
            "
            style={{
              width: `${intensity}%`,
            }}
          />
        </div>
      )}

      {/* =====================================================
          HOVER EFFECT
      ===================================================== */}
      <div className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-t from-black/0 to-black/0
        group-hover:from-black/[0.02]
        pointer-events-none
        transition
      " />
    </div>
  );
}
