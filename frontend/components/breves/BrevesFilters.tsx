"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Period } from "@/app/breves/page";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Company = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

export default function BrevesFilters({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [companies, setCompanies] =
    useState<Company[]>([]);

  const [open, setOpen] = useState(false);

  const selectedCompanies =
    searchParams.getAll("companies");

  /* ================= FETCH ================= */

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${API_BASE}/news/breves/stats`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = await res.json();
      setCompanies(json.top_companies || []);
    }
    load();
  }, []);

  const valueKey =
    selectedPeriod === "total"
      ? "total"
      : selectedPeriod === "7d"
      ? "last_7_days"
      : "last_30_days";

  const sorted = [...companies].sort(
    (a, b) => b[valueKey] - a[valueKey]
  );

  const members = sorted.filter(
    (c) => c.is_partner
  );

  const others = sorted.filter(
    (c) => !c.is_partner
  );

  function toggleCompany(id: string) {
    const params = new URLSearchParams(
      searchParams.toString()
    );
    const current = params.getAll("companies");

    if (current.includes(id)) {
      params.delete("companies");
      current
        .filter((c) => c !== id)
        .forEach((c) =>
          params.append("companies", c)
        );
    } else {
      params.append("companies", id);
    }

    router.push(`/breves?${params.toString()}`);
  }

  return (
    <section className="space-y-6 border-b pb-8">

      {/* ================= MEMBRES ================= */}

      {members.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            Actualités membres
          </h3>

          <div className="flex flex-wrap gap-3">
            {members.slice(0, 6).map((m) => {
              const active =
                selectedCompanies.includes(
                  m.id_company
                );

              return (
                <button
                  key={m.id_company}
                  onClick={() =>
                    toggleCompany(m.id_company)
                  }
                  className={`px-4 py-2 rounded-full text-xs border transition
                    ${
                      active
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }
                  `}
                >
                  {m.name} ({m[valueKey]})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= ACCORDÉON SOCIÉTÉS ================= */}

      <div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs uppercase tracking-wider text-gray-500"
        >
          Sociétés
        </button>

        {open && (
          <div className="mt-4 grid md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {others.map((c) => {
              const active =
                selectedCompanies.includes(
                  c.id_company
                );

              return (
                <button
                  key={c.id_company}
                  onClick={() =>
                    toggleCompany(c.id_company)
                  }
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
                    {c[valueKey]}
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
