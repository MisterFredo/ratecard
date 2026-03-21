"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  label: string;

  nbAnalyses?: number;
  delta30d?: number;
};

export default function TopicCard({
  id,
  label,
  nbAnalyses,
  delta30d,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer } = useDrawer();

  function handleClick() {
    openLeftDrawer("topic", id);

    router.replace(
      `${pathname}?topic_id=${id}`,
      { scroll: false }
    );
  }

  const isTrending = typeof delta30d === "number" && delta30d > 0;

  return (
    <div
      onClick={handleClick}
      className="
        group cursor-pointer rounded-xl
        border border-gray-200
        bg-white p-4
        transition hover:shadow-sm hover:border-gray-300
        relative
      "
    >
      {/* =====================================================
          BADGE TREND
      ===================================================== */}
      {isTrending && (
        <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-600">
          +{delta30d}
        </div>
      )}

      {/* =====================================================
          LABEL
      ===================================================== */}
      <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
        {label}
      </h3>

      {/* =====================================================
          STATS
      ===================================================== */}
      {typeof nbAnalyses === "number" && (
        <p className="mt-1 text-[11px] text-gray-400">
          {nbAnalyses} analyses
        </p>
      )}

      {/* =====================================================
          VISUAL SIGNAL (BAR)
      ===================================================== */}
      {typeof nbAnalyses === "number" && (
        <div className="mt-3 h-1 w-full bg-gray-100 rounded overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all"
            style={{
              width: `${Math.min(nbAnalyses * 2, 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
