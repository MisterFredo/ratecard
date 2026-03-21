"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import CompanyCard from "@/components/companies/CompanyCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES (alignés backend)
========================================================= */

type Company = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;
};

/* =========================================================
   FETCH (Curator source of truth)
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
   PAGE
========================================================= */

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Load companies
  --------------------------------------------------------- */
  useEffect(() => {
    fetchCompanies().then(setCompanies);
  }, []);

  /* ---------------------------------------------------------
     Drawer via URL
     /companies?company_id=XXXX
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Sociétés
        </h1>
        <p className="text-sm text-gray-500">
          Explore les acteurs du marché
        </p>
      </div>

      {/* Grid */}
      {companies.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune société pour le moment.
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
          {companies.map((c) => (
            <CompanyCard
              key={c.id_company}
              id={c.id_company}
              name={c.name}
              logoId={c.media_logo_rectangle_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
