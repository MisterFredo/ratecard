"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import CompanyCard from "@/components/companies/CompanyCard";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

/* ========================================================= */

type Company = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
  nb_analyses: number;
  delta_30d: number;
  universes: string[];
};

type SortMode = "alpha" | "activity" | "growth";

/* =========================================================
   FETCH
========================================================= */

async function fetchCompanies(): Promise<Company[]> {
  try {
    const json = await api.get("/company/list-curator");

    console.log("🔥 RAW API RESPONSE:", json);

    // 🔥 on force le bon format
    const data = json?.companies ?? [];

    if (!Array.isArray(data)) {
      console.error("❌ companies n'est pas un tableau :", data);
      return [];
    }

    return data.map((c: any) => ({
      id_company: c.ID_COMPANY,
      name: c.NAME,
      media_logo_rectangle_id: c.MEDIA_LOGO_RECTANGLE_ID,
      nb_analyses: c.nb_analyses ?? 0,
      delta_30d: c.delta_30d ?? 0,
      universes: c.universes ?? [],
    }));

  } catch (e: any) {
    console.error("❌ fetchCompanies error:", e);

    if (e?.message?.includes("401")) {
      console.warn("⚠️ USER NON AUTHENTIFIÉ → redirect login");
      window.location.href = "/login";
    }

    return [];
  }
}

/* =========================================================
   SORT
========================================================= */

function sortCompanies(
  companies: Company[],
  mode: SortMode
): Company[] {
  const copy = [...companies];

  switch (mode) {
    case "activity":
      return copy.sort(
        (a, b) => (b.nb_analyses ?? 0) - (a.nb_analyses ?? 0)
      );

    case "growth":
      return copy.sort(
        (a, b) => (b.delta_30d ?? 0) - (a.delta_30d ?? 0)
      );

    default:
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }
}

/* =========================================================
   GROUP BY UNIVERSE
========================================================= */

function groupByUniverse(
  companies: Company[],
  mode: SortMode
) {
  const map: Record<string, Company[]> = {};

  companies.forEach((c) => {
    const universes = c.universes ?? [];

    universes.forEach((u) => {
      if (!map[u]) map[u] = [];
      map[u].push(c);
    });
  });

  Object.keys(map).forEach((u) => {
    map[u] = sortCompanies(map[u], mode);
  });

  return map;
}

/* =========================================================
   PAGE
========================================================= */

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     AUTH CHECK (🔥 CRITIQUE)
  --------------------------------------------------------- */
  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    console.log("👤 USER_ID:", userId);

    if (!userId) {
      console.warn("❌ PAS DE USER → redirect login");
      window.location.href = "/login";
    }
  }, []);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const data = await fetchCompanies();

      console.log("📊 COMPANIES LOADED:", data.length);

      setCompanies(data);
      setLoading(false);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     DRAWER
  --------------------------------------------------------- */
  useEffect(() => {
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === companyId) return;

    lastOpenedId.current = companyId;
    openLeftDrawer("company", companyId);
  }, [searchParams, openLeftDrawer]);

  /* ---------------------------------------------------------
     DATA
  --------------------------------------------------------- */

  const grouped = groupByUniverse(companies, sortMode);
  const hasContent = companies.length > 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Sociétés
          </h1>
          <p className="text-sm text-gray-500">
            Explore les acteurs du marché
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
                px-3 py-1 rounded border transition
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

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-400">
          Chargement des sociétés...
        </p>
      )}

      {/* EMPTY */}
      {!loading && !hasContent && (
        <p className="text-sm text-gray-400">
          Aucune société disponible pour votre profil.
        </p>
      )}

      {/* CONTENT */}
      {!loading && hasContent && (
        Object.entries(grouped).map(([universe, items]) => (
          <section key={universe} className="space-y-4">

            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase text-gray-400">
                {universe}
              </h2>

              <span className="text-xs text-gray-300">
                {items.length}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {items.map((c) => (
                <CompanyCard
                  key={c.id_company}
                  id={c.id_company}
                  name={c.name}
                  visualRectId={c.media_logo_rectangle_id}
                  totalAnalyses={c.nb_analyses}
                  delta30d={c.delta_30d}
                />
              ))}
            </div>

          </section>
        ))
      )}

    </div>
  );
}
