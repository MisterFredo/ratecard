"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ================= TYPES ================= */

type RawStats = {
  total: number;
  total_stored: number;
  total_processing: number;
  total_error: number;
};

type ContentStats = {
  total: number;
  total_draft: number;
  total_ready: number;
  total_published: number;
  total_scheduled: number;
  total_published_this_year: number;
  total_published_this_month: number;
};

type NewsAdminStats = {
  total: number;
  total_published: number;
  total_draft: number;
  total_news: number;
  total_briefs: number;
  total_published_this_year: number;
};

type BrevesPublicStats = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

/* ================= COMPONENT ================= */

export default function AdminHome() {

  const [rawStats, setRawStats] = useState<RawStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [newsAdminStats, setNewsAdminStats] = useState<NewsAdminStats | null>(null);
  const [brevesStats, setBrevesStats] = useState<BrevesPublicStats | null>(null);

  const [loading, setLoading] = useState(true);

  // 🔥 BACKLOG
  const [backlogItems, setBacklogItems] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {

        const [
          rawRes,
          contentRes,
          newsAdminRes,
          brevesRes
        ] = await Promise.all([
          api.get("/content/raw/admin/stats"),
          api.get("/content/admin/stats"),
          api.get("/news/admin/stats"),
          api.get("/news/breves/stats"),
        ]);

        setRawStats(rawRes.stats);
        setContentStats(contentRes.stats);
        setNewsAdminStats(newsAdminRes.stats);

        setBrevesStats({
          total_count: brevesRes.total_count,
          last_7_days: brevesRes.last_7_days,
          last_30_days: brevesRes.last_30_days,
        });

      } catch (e) {
        console.error("Erreur dashboard admin", e);
      }

      setLoading(false);
    }

    loadStats();
  }, []);

  /* ================= BACKLOG ================= */

  async function runBacklog() {

    try {

      setProcessing(true);

      const res = await api.post(
        "/numbers/backlog/process?limit=50",
        {}
      );

      setBacklogItems(res.items || []);

    } catch (e) {
      console.error("Erreur backlog", e);
    }

    setProcessing(false);
  }

  if (loading) return <div>Chargement dashboard…</div>;

  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-semibold text-ratecard-blue">
        Dashboard Admin
      </h1>

      {/* ================= KPI GLOBAL ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <KpiCard label="RAW" value={rawStats?.total} />
        <KpiCard label="Content" value={contentStats?.total} />
        <KpiCard label="News" value={newsAdminStats?.total} />
        <KpiCard label="Publié (30j)" value={brevesStats?.last_30_days} />

      </div>

      {/* ================= DETAIL ================= */}

      <Section title="Pipeline">

        <CompactRow
          label="RAW"
          items={[
            ["Stock", rawStats?.total_stored],
            ["Processing", rawStats?.total_processing],
            ["Error", rawStats?.total_error],
          ]}
        />

        <CompactRow
          label="Content"
          items={[
            ["Draft", contentStats?.total_draft],
            ["Ready", contentStats?.total_ready],
            ["Published", contentStats?.total_published],
          ]}
        />

        <CompactRow
          label="News"
          items={[
            ["Published", newsAdminStats?.total_published],
            ["Draft", newsAdminStats?.total_draft],
            ["Brèves", newsAdminStats?.total_briefs],
          ]}
        />

      </Section>

      {/* ================= BACKLOG (🔥 NOUVEAU) ================= */}

      <Section title="Numbers Backlog (LLM)">

        <div className="flex items-center gap-4">

          <button
            onClick={runBacklog}
            disabled={processing}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {processing ? "Processing..." : "Process 50"}
          </button>

          <span className="text-sm text-gray-400">
            {backlogItems.length} lignes
          </span>

        </div>

        <div className="border rounded mt-4 max-h-[400px] overflow-y-auto">

          {backlogItems.map((item, i) => {

            const out = item.output || {};

            return (
              <div key={i} className="p-3 border-b text-sm">

                <div className="text-gray-500">
                  {item.input?.chiffre}
                </div>

                {item.status === "error" && (
                  <div className="text-red-500 text-xs">
                    ERROR
                  </div>
                )}

                {item.status === "ok" && (
                  <div
                    className={
                      out.decision === "KEEP"
                        ? "text-green-600 text-xs"
                        : "text-gray-400 text-xs"
                    }
                  >
                    {out.decision} — {out.label}
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </Section>

    </div>
  );
}

/* ================= UI ================= */

function Section({ title, children }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function KpiCard({ label, value }: any) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-2xl font-semibold">
        {value ?? 0}
      </div>
    </div>
  );
}

function CompactRow({ label, items }: any) {
  return (
    <div className="flex items-center justify-between border rounded p-3 text-sm">

      <div className="font-medium w-24">
        {label}
      </div>

      <div className="flex gap-6">
        {items.map(([k, v]: any, i: number) => (
          <div key={i}>
            <span className="text-gray-400">{k}</span>{" "}
            <span className="font-medium">{v ?? 0}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
