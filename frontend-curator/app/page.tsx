"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [step, setStep] = useState(5); // 🔥 FORCE AFFICHAGE POUR DEBUG

  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    async function load() {
      try {
        console.log("🚀 CALL API");

        const sourcesRes = await api.get("/source/list");
        const companiesRes = await api.get("/company/list");

        console.log("✅ SOURCES RES:", sourcesRes);
        console.log("✅ COMPANIES RES:", companiesRes);

        setSources(sourcesRes.sources || []);
        setCompanies(companiesRes.companies || []);
      } catch (e) {
        console.error("❌ Home load error", e);
        setError("Erreur de chargement des données");
      }
    }

    load();
  }, []);

  // =========================
  // KEYBOARD CONTROL
  // =========================
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setStep((s) => s + 1);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // =========================
  // DEBUG LOGS
  // =========================
  useEffect(() => {
    console.log("📊 sources length:", sources.length);
    console.log("📊 companies length:", companies.length);
    console.log("📊 step:", step);
  }, [sources, companies, step]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-6">

      <h1 className="text-4xl font-bold mb-10 text-center">
        DEBUG HOME
      </h1>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* SOURCES */}
      {/* ========================= */}
      <div className="mb-10">
        <h2 className="text-xl mb-4">SOURCES</h2>

        <div className="flex flex-wrap gap-4 max-w-4xl justify-center">
          {sources.slice(0, 10).map((s) => {
            const src = `${GCS_BASE_URL}/${s.logo}`;

            console.log("🟡 SOURCE LOGO:", src);

            return (
              <div key={s.source_id} className="flex flex-col items-center">
                <img
                  src={src}
                  alt={s.name}
                  style={{ height: 40 }}
                />
                <div className="text-xs">{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================= */}
      {/* COMPANIES */}
      {/* ========================= */}
      <div>
        <h2 className="text-xl mb-4">COMPANIES</h2>

        <div className="flex flex-wrap gap-4 max-w-5xl justify-center">
          {companies.slice(0, 10).map((c) => {
            const src = `${GCS_BASE_URL}/companies/${c.media_logo_rectangle_id}`;

            console.log("🔵 COMPANY LOGO:", src);

            return (
              <div key={c.id_company} className="flex flex-col items-center">
                <img
                  src={src}
                  alt={c.name}
                  style={{ height: 40 }}
                />
                <div className="text-xs">{c.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP CONTROL */}
      <button
        onClick={() => setStep((s) => s + 1)}
        className="mt-10 px-6 py-3 bg-black text-white rounded-lg"
      >
        Next →
      </button>
    </div>
  );
}
