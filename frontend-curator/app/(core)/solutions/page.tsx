"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import SolutionCard from "@/components/solutions/SolutionCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES (alignés backend)
========================================================= */

type Solution = {
  id_solution: string;
  name: string;
};

/* =========================================================
   FETCH
========================================================= */

async function fetchSolutions(): Promise<Solution[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solution/list`,
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
  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Load solutions
  --------------------------------------------------------- */
  useEffect(() => {
    fetchSolutions().then(setSolutions);
  }, []);

  /* ---------------------------------------------------------
     Drawer via URL
     /solutions?solution_id=XXXX
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Solutions
        </h1>
        <p className="text-sm text-gray-500">
          Explore les solutions du marché
        </p>
      </div>

      {/* Grid */}
      {solutions.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune solution pour le moment.
        </p>
      ) : (
        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            gap-4
          "
        >
          {solutions.map((s) => (
            <SolutionCard
              key={s.id_solution}
              id={s.id_solution}
              name={s.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
