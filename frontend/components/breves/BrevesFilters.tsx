"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type CompanyStat = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type StatsResponse = {
  top_companies: CompanyStat[];
};

export default function BrevesFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [mode, setMode] = useState<
    "total" | "last_7_days" | "last_30_days"
  >("last_7_days");

  const [open, setOpen] = useState(false);

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
      (a, b) => (b as any)[mode] - (a as any)[mode]
    );
  }, [companies, mode]);

  /* =========================================================
     TOGGLE FILTER
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
     UI HELPERS
  ========================================================= */

  function SwitchButton({
    value,
    label,
  }: {
    value: "total" | "last_7_days" | "last_30_days";
    label: string;
  }) {
    const active = mode === value;

    return (
      <button
        onClick={() => setMode(value)}
        className={`text-xs uppercase tracking-wider transition
          ${
            active
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }`}
      >
        {label}
      </button>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="border-b pb-10 mb-10">

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-sm font-medium tracking-wide text-gray-700">
          Acteurs
        </h2>

        <div className="flex gap-6">
          <SwitchButton value="total" label="Total" />
          <SwitchButton value="last_7_days" label="7j" />
          <SwitchButton value="last_30_days" label="30j" />
        </div>
      </div>

      {/* MEMBERS */}
      {members.length > 0 && (
        <div className="mb-6">

          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">
            Actualités membres
          </h3>

          <div className="flex flex-wrap gap-3">
            {members.map((c) => {
              const active = selectedCompanies.includes(
                c.id_company
              );

              return (
                <button
                  key={c.id_company}
                  onClick={() => toggleCompany(c.id_company)}
                  className={`px-3 py-1.5 text-xs rounded-full transition
                    ${
                      active
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  {c.name}{" "}
                  <span className="font-serif ml-1">
                    {(c as any)[mode]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* OTHERS ACCORDION */}
      <div>

        <button
          onClick={() => setOpen(!open)}
          className="text-xs uppercase tracking-wider text-gray-500 hover:text-black transition"
        >
          {open ? "Masquer autres acteurs" : "Afficher autres acteurs"}
        </button>

        {open && (
          <div className="mt-6 grid md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
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
                        : "text-gray-600 hover:text-black"
                    }
                  `}
                >
                  <span>{c.name}</span>
                  <span className="font-serif">
                    {(c as any)[mode]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </section>
  );
}
