"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ContentLite = {
  ID_CONTENT: string;
  TITLE: string;
  STATUS: string;
  PUBLISHED_AT?: string | null;
  DATE_CREATION?: string | null;

  // 🔥 NOUVEAU
  topics?: { LABEL: string }[];
  concepts?: { TITLE: string }[];
};

type ContentStats = {
  TOTAL: number;
  TOTAL_PUBLISHED: number;
  TOTAL_DRAFT: number;
  TOTAL_PUBLISHED_THIS_YEAR: number;
  TOTAL_PUBLISHED_THIS_MONTH: number;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ContentListPage() {
  const [contents, setContents] = useState<ContentLite[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const [listRes, statsRes] = await Promise.all([
        api.get("/content/list"),
        api.get("/content/admin/stats"),
      ]);

      setContents(listRes.contents || []);
      setStats(statsRes.stats || null);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement contenus");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  function isScheduled(c: ContentLite) {
    if (!c.PUBLISHED_AT) return false;
    return new Date(c.PUBLISHED_AT) > new Date();
  }

  /* ---------------------------------------------------------
     🔥 TRI INTELLIGENT
     1. Draft
     2. Scheduled
     3. Published (desc)
  --------------------------------------------------------- */

   const sortedContents = useMemo(() => {
     return [...contents].sort((a, b) => {

       if (a.STATUS === "DRAFT" && b.STATUS !== "DRAFT") return -1;
       if (b.STATUS === "DRAFT" && a.STATUS !== "DRAFT") return 1;

       const now = new Date();

       const aScheduled =
         a.PUBLISHED_AT && new Date(a.PUBLISHED_AT) > now;
       const bScheduled =
         b.PUBLISHED_AT && new Date(b.PUBLISHED_AT) > now;

       if (aScheduled && !bScheduled) return -1;
       if (bScheduled && !aScheduled) return 1;

       const dateA = new Date(a.PUBLISHED_AT || 0).getTime();
       const dateB = new Date(b.PUBLISHED_AT || 0).getTime();

       return dateB - dateA;
     });
   }, [contents]);

   if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Contenus
        </h1>

        <Link
          href="/admin/content/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouveau contenu
        </Link>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.TOTAL} />
          <StatCard label="Publiés" value={stats.TOTAL_PUBLISHED} green />
          <StatCard label="Drafts" value={stats.TOTAL_DRAFT} yellow />
          <StatCard
            label="Publiés (année)"
            value={stats.TOTAL_PUBLISHED_THIS_YEAR}
          />
          <StatCard
            label="Ce mois-ci"
            value={stats.TOTAL_PUBLISHED_THIS_MONTH}
          />
        </div>
      )}

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Titre</th>
            <th className="p-2">Topic</th>
            <th className="p-2">Concept</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Date contexte</th>
            <th className="p-2">Publié le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedContents.map((c) => (
            <tr
              key={c.ID_CONTENT}
              className="border-b hover:bg-gray-50 transition"
            >
              {/* TITRE */}
              <td className="p-2 font-medium">
                {c.TITLE}
              </td>

              {/* TOPIC */}
              <td className="p-2 text-gray-600">
                {c.topics?.length
                  ? c.topics.map((t) => t.LABEL).join(", ")
                  : "—"}
              </td>

              {/* CONCEPT */}
              <td className="p-2 text-gray-600">
                {c.concepts?.length
                  ? c.concepts.map((co) => co.TITLE).join(", ")
                  : "—"}
              </td>

              {/* STATUS */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    c.STATUS === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : c.STATUS === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {c.STATUS}
                </span>
              </td>

              {/* DATE CONTEXTE */}
              <td className="p-2 text-gray-600">
                {formatDate(c.DATE_CREATION)}
              </td>

              {/* DATE PUBLICATION */}
              <td className="p-2">
                {formatDate(c.PUBLISHED_AT)}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right">
                <Link
                  href={`/admin/content/edit/${c.ID_CONTENT}`}
                  className="inline-flex items-center gap-1 text-ratecard-blue hover:text-ratecard-blue/80"
                >
                  <Pencil size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  green,
  yellow,
}: {
  label: string;
  value: number;
  green?: boolean;
  yellow?: boolean;
}) {
  let bg = "bg-white";
  let text = "text-gray-800";

  if (green) {
    bg = "bg-green-50";
    text = "text-green-700";
  }

  if (yellow) {
    bg = "bg-yellow-50";
    text = "text-yellow-700";
  }

  return (
    <div className={`${bg} rounded-lg p-4 border`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${text}`}>
        {value}
      </div>
    </div>
  );
}
