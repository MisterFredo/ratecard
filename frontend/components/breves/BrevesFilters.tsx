"use client";

import { useEffect, useState } from "react";
import { Period } from "@/app/breves/page";

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

export default function BrevesFilters({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const [stats, setStats] =
    useState<StatsResponse | null>(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${API_BASE}/news/breves/stats`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = await res.json();
      setStats(json);
    }
    load();
  }, []);

  if (!stats) return null;

  const sorted = [...stats.top_companies].sort(
    (a, b) => {
      const key =
        selectedPeriod === "total"
          ? "total"
          : selectedPeriod === "7d"
          ? "last_7_days"
          : "last_30_days";

      return b[key] - a[key];
    }
  );

  const members = sorted.filter(
    (c) => c.is_partner
  );
  const others = sorted.filter(
    (c) => !c.is_partner
  );

  return (
    <section className="space-y-6">

      {/* ACTUALITÉS MEMBRES */}
      {members.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            Actualités membres
          </h3>

          <div className="flex flex-wrap gap-3">
            {members.slice(0, 6).map((m) => (
              <Tag
                key={m.id_company}
                label={m.name}
                value={
                  selectedPeriod === "total"
                    ? m.total
                    : selectedPeriod === "7d"
                    ? m.last_7_days
                    : m.last_30_days
                }
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* ACCORDÉON SOCIÉTÉS */}
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs uppercase tracking-wider text-gray-500"
        >
          Sociétés
        </button>

        {open && (
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((c) => (
              <Tag
                key={c.id_company}
                label={c.name}
                value={
                  selectedPeriod === "total"
                    ? c.total
                    : selectedPeriod === "7d"
                    ? c.last_7_days
                    : c.last_30_days
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Tag({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs border ${
        highlight
          ? "border-black bg-black text-white"
          : "border-gray-300 text-gray-700"
      }`}
    >
      {label} ({value})
    </div>
  );
}
