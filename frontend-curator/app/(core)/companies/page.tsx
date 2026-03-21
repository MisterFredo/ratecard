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
  description?: string | null;
  media_logo_rectangle_id?: string | null;
  is_partner: boolean;
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

  /* ---------------------------------------------------------
     SPLIT + SORT
  --------------------------------------------------------- */

  const partners = companies
    .filter((c) => c.is_partner)
    .sort((a, b) => a.name.localeCompare(b.name));

  const others = companies
    .filter((c) => !c.is_partner)
    .sort((a, b) => a.name.localeCompare(b.name));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Sociétés
        </h1>
        <p className="text-sm text-gray-500">
          Explore les acteurs du marché
        </p>
      </div>

      {/* PARTENAIRES */}
      {partners.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Partenaires
          </h2>

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
            {partners.map((c) => (
              <CompanyCard
                key={c.id_company}
                id={c.id_company}
                name={c.name}
                visualRectId={c.media_logo_rectangle_id}
              />
            ))}
          </div>
        </section>
      )}

      {/* AUTRES SOCIÉTÉS */}
      {others.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Sociétés
          </h2>

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
            {others.map((c) => (
              <CompanyCard
                key={c.id_company}
                id={c.id_company}
                name={c.name}
                visualRectId={c.media_logo_rectangle_id}
              />
            ))}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {companies.length === 0 && (
        <p className="text-sm text-gray-400">
          Aucune société pour le moment.
        </p>
      )}
    </div>
  );
}
