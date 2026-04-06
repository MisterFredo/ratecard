"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type Run = {
  id_run: string;
  id_template: string;
  period: string;
  status: string;
  created_at: string;
};

export default function DigestRunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  /* =========================================================
     LOAD RUNS
  ========================================================= */

  async function loadRuns() {
    try {
      const res = await api.get("/admin/digest/run");
      setRuns(res.runs || []);
    } catch (e) {
      console.error("Erreur load runs", e);
    }
  }

  useEffect(() => {
    loadRuns();
  }, []);

  /* =========================================================
     GENERATE RUNS
  ========================================================= */

  async function handleGenerate() {
    const period = prompt("Période (ex: 2026-03)");

    if (!period) return;

    setLoading(true);

    try {
      await api.post("/admin/digest/run/generate", {
        period,
      });

      await loadRuns();

      alert("Runs générés");
    } catch (e) {
      console.error(e);
      alert("Erreur génération");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     OPEN RUN
  ========================================================= */

  function openRun(id: string) {
    router.push(`/admin/digest?run=${id}`);
  }

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  function StatusBadge({ status }: { status: string }) {
    const styles =
      status === "draft"
        ? "bg-gray-200 text-gray-700"
        : status === "ready"
        ? "bg-green-100 text-green-700"
        : status === "sent"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-500";

    return (
      <span className={`px-2 py-1 text-xs rounded ${styles}`}>
        {status}
      </span>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Runs Digest
        </h1>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-2 bg-black text-white text-xs rounded"
        >
          Générer (mois)
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded">

        <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-500 border-b">
          <div>Période</div>
          <div>Template</div>
          <div>Status</div>
          <div>Date</div>
          <div></div>
        </div>

        {runs.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            Aucun run
          </div>
        )}

        {runs.map((r) => (
          <div
            key={r.id_run}
            className="grid grid-cols-5 px-4 py-3 text-sm border-b items-center hover:bg-gray-50"
          >
            <div>{r.period}</div>

            <div className="text-xs text-gray-500">
              {r.id_template}
            </div>

            <div>
              <StatusBadge status={r.status} />
            </div>

            <div className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleDateString()}
            </div>

            <div className="text-right">
              <button
                onClick={() => openRun(r.id_run)}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
              >
                Ouvrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
