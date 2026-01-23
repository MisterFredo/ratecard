"use client";

import { useEffect, useState } from "react";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type NewsItemRaw = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  PUBLISHED_AT?: string | null;

  COMPANY_NAME: string;
  IS_PARTNER?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at: string;

  company: {
    name: string;
    is_partner: boolean;
  };
};

type Mode = "focus" | "all";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const FOCUS_LIMIT = 6;

function getScopeQuery(
  scopeType: "topic" | "company",
  scopeId: string
) {
  return scopeType === "topic"
    ? `topic_id=${encodeURIComponent(scopeId)}`
    : `company_id=${encodeURIComponent(scopeId)}`;
}

export default function DashboardNews({
  scopeType,
  scopeId,
}: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("focus");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const scopeQuery = getScopeQuery(scopeType, scopeId);
      const limit =
        mode === "focus" ? `&limit=${FOCUS_LIMIT}` : "";

      try {
        const res = await fetch(
          `${API_BASE}/news/list?${scopeQuery}${limit}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error();

        const json = await res.json();

        const mapped: NewsItem[] = (json.news || []).map(
          (n: NewsItemRaw) => ({
            id: n.ID_NEWS,
            title: n.TITLE,
            excerpt: n.EXCERPT ?? null,
            published_at: n.PUBLISHED_AT || "",
            company: {
              name: n.COMPANY_NAME,
              is_partner: n.IS_PARTNER === true,
            },
          })
        );

        setItems(mapped);
      } catch (e) {
        console.error(e);
        setItems([]);
      }

      setLoading(false);
    }

    load();
  }, [scopeType, scopeId, mode]);

  return (
    <section className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          News
        </h2>

        {mode === "focus" && items.length === FOCUS_LIMIT && (
          <button
            onClick={() => setMode("all")}
            className="text-sm text-blue-600 hover:underline"
          >
            Voir toutes
          </button>
        )}

        {mode === "all" && (
          <button
            onClick={() => setMode("focus")}
            className="text-sm text-gray-500 hover:underline"
          >
            Vue réduite
          </button>
        )}
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des news…
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune news disponible pour ce périmètre.
        </p>
      )}

      {/* LIST — SANS VISUELS */}
      <div
        className={`space-y-2 ${
          mode === "all"
            ? "max-h-[420px] overflow-y-auto"
            : ""
        }`}
      >
        {items.map((n) => (
          <PartnerSignalCard
            key={n.id}
            id={n.id}
            title={n.title}
            excerpt={n.excerpt}
            companyName={n.company.name}
            isPartner={n.company.is_partner}
            publishedAt={n.published_at}
            openInDrawer
          />
        ))}
      </div>
    </section>
  );
}
