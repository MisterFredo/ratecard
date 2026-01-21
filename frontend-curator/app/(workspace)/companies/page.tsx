"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import CompanyCard from "@/components/companies/CompanyCard";

type CompanyItem = {
  id_company: string;
  name: string;
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
          setCompanies(json.companies || []);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header>
        <h1 className="text-2xl font-semibold">
          Sociétés
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore les acteurs analysés par Curator
        </p>
      </header>

      {/* =====================================================
          GRID
      ===================================================== */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard
            key={company.id_company}
            label={company.name}
            onClick={() =>
              openDrawer("left", {
                type: "dashboard",
                payload: {
                  scopeType: "company",
                  scopeId: company.name,
                },
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
