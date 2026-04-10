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
  universes?: string[];
};

/* =========================================================
   UTILS
========================================================= */

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

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

async function fetchUserUniverses(userId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/context/${userId}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const json = await res.json();

    return json?.universes || [];

  } catch {
    return [];
  }
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
   FILTER LOGIC 🔥
========================================================= */

function filterCompaniesByUniverses(
  companies: Company[],
  userUniverses: string[]
): Company[] {

  // 👉 ADMIN / FULL ACCESS
  if (!userUniverses || userUniverses.length === 0) {
    return companies;
  }

  return companies.filter((c) => {
    // 👉 GLOBAL company (no universes)
    if (!c.universes || c.universes.length === 0) {
      return true;
    }

    // 👉 intersection
    return c.universes.some((u) =>
      userUniverses.includes(u)
    );
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {

      const allCompanies = await fetchCompanies();

      const userId = getCookie("curator_user_id");

      if (!userId) {
        setCompanies(allCompanies);
        setFilteredCompanies(allCompanies);
        return;
      }

      const userUniverses = await fetchUserUniverses(userId);

      const filtered = filterCompaniesByUniverses(
        allCompanies,
        userUniverses
      );

      setCompanies(allCompanies);
      setFilteredCompanies(filtered);
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
     SPLIT + SORT
  --------------------------------------------------------- */

  const partners = sortCompanies(
    filteredCompanies.filter((c) => c.is_partner),
    sortMode
  );

  const others = sortCompanies(
    filteredCompanies.filter((c) => !c.is_partner),
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

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
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

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
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
      {filteredCompanies.length === 0 && (
        <p className="text-sm text-gray-400">
          Aucune société disponible pour votre profil.
        </p>
      )}
    </div>
  );
}
