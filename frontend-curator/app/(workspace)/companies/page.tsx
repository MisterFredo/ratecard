"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import CompanyCard from "@/components/companies/CompanyCard";

type CompanyItem = {
  id_company: string;
  label: string;
  nb_analyses: number;
  delta_30d?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { openDrawer } = useDrawer();

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/company/list`, {
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();

          const mappedCompanies = (json.companies || []).map((c: any) => ({
            id_company: c.ID_COMPANY,
            label: c.NAME,
            nb_analyses: c.NB_ANALYSES ?? 0,
            delta_30d: c.DELTA_30D ?? 0,
          }));

          setCompanies(mappedCompanies);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, []);

  const activeCompanies = companies
    .filter((c) => c.nb_analyses > 0)
    .sort((a, b) => b.nb_analyses - a.nb_analyses);

  const otherCompanies = companies
    .filter((c) => c.nb_analyses === 0)
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-10">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header>
        <h1 className="text-2xl font-semibold">
          Sociétés
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Acteurs suivis et analysés par Curator
        </p>
      </header>

      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des sociétés…
        </p>
      )}

      {!loading && companies.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune société disponible.
        </p>
      )}

      {/* =====================================================
          SOCIÉTÉS EN MOUVEMENT
      ===================================================== */}
      {!loading && activeCompanies.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Sociétés en mouvement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCompanies.map((company) => (
              <CompanyCard
                key={company.id_company}
                label={company.label}
                nbAnalyses={company.nb_analyses}
                delta30d={company.delta_30d}
                variant="active"
                onClick={() =>
                  openDrawer("left", {
                    type: "dashboard",
                    payload: {
                      scopeType: "company",
                      scopeId: company.label,
                    },
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          AUTRES SOCIÉTÉS
      ===================================================== */}
      {!loading && otherCompanies.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Autres sociétés suivies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {otherCompanies.map((company) => (
              <CompanyCard
                key={company.id_company}
                label={company.label}
                nbAnalyses={company.nb_analyses}
                variant="default"
                onClick={() =>
                  openDrawer("left", {
                    type: "dashboard",
                    payload: {
                      scopeType: "company",
                      scopeId: company.label,
                    },
                  })
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

