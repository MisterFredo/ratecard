"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [visibleSources, setVisibleSources] = useState(0);
  const [visibleCompanies, setVisibleCompanies] = useState(0);

  const [phase, setPhase] = useState<"sources" | "companies">("sources");

  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH REAL DATA (ROBUSTE)
  // =========================
  useEffect(() => {
    async function load() {
      try {
        const resSources = await fetch(`${API}/api/source/list`);
        const resCompanies = await fetch(`${API}/api/company/list`);

        const dataSources = await resSources.json();
        const dataCompanies = await resCompanies.json();

        setSources(dataSources.sources || []);
        setCompanies(dataCompanies.companies || []);
      } catch (e) {
        console.error(e);
        setError("Erreur de chargement API");
      }
    }

    load();
  }, []);

  // =========================
  // ANIMATION SOURCES
  // =========================
  useEffect(() => {
    if (phase !== "sources" || sources.length === 0) return;

    const interval = setInterval(() => {
      setVisibleSources((prev) => {
        if (prev >= Math.min(sources.length, 30)) {
          setPhase("companies");
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [sources, phase]);

  // =========================
  // ANIMATION COMPANIES
  // =========================
  useEffect(() => {
    if (phase !== "companies" || companies.length === 0) return;

    const interval = setInterval(() => {
      setVisibleCompanies((prev) =>
        Math.min(prev + 5, Math.min(companies.length, 120))
      );
    }, 60);

    return () => clearInterval(interval);
  }, [companies, phase]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-white px-6">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-10 text-center">
        L’information est partout
      </h1>

      {/* ERROR */}
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      {/* ========================= */}
      {/* SOURCES */}
      {/* ========================= */}
      {phase === "sources" && (
        <div className="flex flex-wrap gap-3 max-w-4xl justify-center animate-fade-in">
          {sources.slice(0, visibleSources).map((s) => (
            <Item key={s.source_id} label={s.name} />
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* COMPANIES */}
      {/* ========================= */}
      {phase === "companies" && (
        <>
          <h2 className="text-2xl mt-6 mb-6 text-gray-600">
            Et des centaines d’acteurs
          </h2>

          <div className="flex flex-wrap gap-2 max-w-5xl justify-center animate-fade-in">
            {companies.slice(0, visibleCompanies).map((c) => (
              <Item key={c.id_company} label={c.name} small />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =========================
// COMPONENT
// =========================

function Item({ label, small = false }: any) {
  return (
    <div
      className={`px-3 py-1 rounded-md bg-gray-200 transition-all duration-300 ${
        small ? "text-xs" : "text-sm"
      }`}
    >
      {label}
    </div>
  );
}
