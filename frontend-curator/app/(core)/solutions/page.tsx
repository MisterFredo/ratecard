"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import SolutionCard from "@/components/solutions/SolutionCard";

import { Solution } from "@/types/feed";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type SortMode = "alpha" | "activity" | "growth";

/* =========================================================
   SORT
========================================================= */

function sortSolutions(items: Solution[], mode: SortMode) {
  const copy = [...items];

  switch (mode) {
    case "activity":
      return copy.sort(
        (a, b) =>
          (b.nb_analyses || 0) - (a.nb_analyses || 0)
      );

    case "growth":
      return copy.sort(
        (a, b) =>
          (b.delta_30d || 0) - (a.delta_30d || 0)
      );

    default:
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }
}

/* =========================================================
   FETCH
========================================================= */

async function fetchSolutions(): Promise<Solution[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solution/list-curator`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();

  if (json.status !== "ok") return [];

  return json.solutions || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      const data = await fetchSolutions();
      setSolutions(data);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     DRAWER
  --------------------------------------------------------- */
  useEffect(() => {
    const solutionId = searchParams.get("solution_id");

    if (!solutionId) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === solutionId) return;

    lastOpenedId.current = solutionId;
    openLeftDrawer("solution", solutionId);
  }, [searchParams, openLeftDrawer]);

  /* ---------------------------------------------------------
     SORT
  --------------------------------------------------------- */

  const sorted = sortSolutions(solutions, sortMode);

  /* ========================================================= */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Solutions
          </h1>
          <p className="text-sm text-gray-500">
            Explore les solutions du marché
          </p>
        </div>

        {/* SORT */}
        <div className="flex gap-2 text-xs">
          {[
            { key: "alpha", label: "A → Z" },
            { key: "activity", label: "Activité" },
            { key: "growth", label: "Croissance" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() =>
                setSortMode(s.key as SortMode)
              }
              className={`
                px-3 py-1 rounded border
                ${
                  sortMode === s.key
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune solution disponible pour votre profil.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {sorted.map((s) => (
            <SolutionCard
              key={s.id_solution}
              id={s.id_solution}
              name={s.name}
              visualRectId={s.media_logo_rectangle_id}
              nbAnalyses={s.nb_analyses}
              delta30d={s.delta_30d}
              isPartner={s.is_partner}
            />
          ))}
        </div>
      )}

    </div>
  );
}
