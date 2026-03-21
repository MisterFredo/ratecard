"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import CompanyCard from "@/components/companies/CompanyCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Company = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
  is_partner: boolean;
  nb_analyses: number;
  delta_30d: number;
};

/* =========================================================
   FETCH
========================================================= */

async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/company/list`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();

  if (json.status !== "ok") return [];

  return json.companies || [];
}

/* =========================================================
   SORT
========================================================= */

type SortMode = "alpha" | "activity" | "growth";

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
   PAGE
========================================================= */

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    fetchCompanies().then(setCompanies);
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
     SPLIT + SORT
  --------------------------------------------------------- */

  const partners = sortCompanies(
    companies.filter((c) => c.is_partner),
    sortMode
  );

  const others = sortCompanies(
    companies.filter((c) => !c.is_partner),
    sortMode
  );

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

      {/* PARTENAIRES */}
      {partners.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500">
            Partenaires
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {partners.map((c) => (
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
      )}

      {/* AUTRES */}
      {others.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500">
            Sociétés
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {others.map((c) => (
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
      )}

      {/* EMPTY */}
      {companies.length === 0 && (
        <p className="text-sm text-gray-400">
          Aucune société pour le moment.
        </p>
      )}
    </div>
  );
}
