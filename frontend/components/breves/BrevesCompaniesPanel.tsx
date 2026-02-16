"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type CompanyMover = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type StatsResponse = {
  top_companies: CompanyMover[];
};

export default function BrevesCompaniesPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyMover[]>([]);
  const [sortMode, setSortMode] = useState<
    "total" | "last_7_days" | "last_30_days"
  >("last_7_days");

  const selectedCompanies = searchParams.getAll("companies");

  /* =========================================================
     FETCH STATS
  ========================================================= */

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${API_BASE}/news/breves/stats`,
        { cache: "no-store" }
      );

      if (!res.ok) return;

      const json: StatsResponse = await res.json();
      setCompanies(json.top_companies || []);
    }

    load();
  }, []);

  /* =========================================================
     SPLIT MEMBERS / OTHERS
  ========================================================= */

  const members = useMemo(
    () => companies.filter((c) => c.is_partner),
    [companies]
  );

  const others = useMemo(() => {
    const list = companies.filter((c) => !c.is_partner);

    return [...list].sort(
      (a, b) => (b as any)[sortMode] - (a as any)[sortMode]
    );
  }, [companies, sortMode]);

  /* =========================================================
     TOGGLE COMPANY FILTER
  ========================================================= */

  function toggleCompany(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("companies");

    if (current.includes(id)) {
      params.delete("companies");
      current
        .filter((c) => c !== id)
        .forEach((c) => params.append("companies", c));
    } else {
      params.append("companies", id);
    }

    router.push(`/breves?${params.toString()}`);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="border-b border-black pb-14 mb-14">

      {/* TITLE */}
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-lg font-serif tracking-tight">
          Acteurs du marché
        </h2>

        {/* SORT SWITCH */}
        <div className="flex gap-6 text-xs uppercase tracking-wider">
          <button
            onClick={() => setSortMode("total")}
            className={sortMode === "total" ? "underline" : ""}
          >
            Total
          </button>
          <button
            onClick={() => setSortMode("last_7_days")}
            className={sortMode === "last_7_days" ? "underline" : ""}
          >
            7 jours
          </button>
          <button
            onClick={() => setSortMode("last_30_days")}
            className={sortMode === "last_30_days" ? "underline" : ""}
          >
            30 jours
          </button>
        </div>
      </div>

      {/* ================= MEMBERS ================= */}
      {members.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
            Membres
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {members.map((c) => {
              const active = selectedCompanies.includes(
                c.id_company
              );

              return (
                <button
                  key={c.id_company}
                  onClick={() => toggleCompany(c.id_company)}
                  className={`text-left border p-6 transition
                    ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-white hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="text-sm font-medium mb-3">
                    {c.name}
                  </div>

                  <div className="flex justify-between text-sm font-serif">
                    <span>{c.last_7_days} (7j)</span>
                    <span>{c.last_30_days} (30j)</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= OTHERS ================= */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
          Autres acteurs
        </h3>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
          {others.map((c) => {
            const active = selectedCompanies.includes(
              c.id_company
            );

            return (
              <button
                key={c.id_company}
                onClick={() => toggleCompany(c.id_company)}
                className={`flex justify-between border-b pb-2 transition
                  ${
                    active
                      ? "text-black font-semibold"
                      : "text-gray-700 hover:text-black"
                  }
                `}
              >
                <span>{c.name}</span>
                <span className="font-serif">
                  {(c as any)[sortMode]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
}
