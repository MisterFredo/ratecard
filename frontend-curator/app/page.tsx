"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [visibleSources, setVisibleSources] = useState(0);
  const [visibleCompanies, setVisibleCompanies] = useState(0);

  const [phase, setPhase] = useState<"sources" | "companies">("sources");

  // =========================
  // FETCH REAL DATA
  // =========================
  useEffect(() => {
    fetch("/source/list")
      .then((r) => r.json())
      .then((data) => setSources(data.sources || []));

    fetch("/company/list")
      .then((r) => r.json())
      .then((data) => setCompanies(data.companies || []));
  }, []);

  // =========================
  // ANIMATION SOURCES
  // =========================
  useEffect(() => {
    if (phase !== "sources" || sources.length === 0) return;

    const interval = setInterval(() => {
      setVisibleSources((prev) => {
        if (prev >= sources.length) {
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
        Math.min(prev + 4, companies.length)
      );
    }, 60);

    return () => clearInterval(interval);
  }, [companies, phase]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-white">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-10 text-center">
        L’information est partout
      </h1>

      {/* ========================= */}
      {/* SOURCES */}
      {/* ========================= */}
      {phase === "sources" && (
        <div className="flex flex-wrap gap-3 max-w-4xl justify-center">
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

          <div className="flex flex-wrap gap-2 max-w-5xl justify-center">
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
      className={`px-3 py-1 rounded-md bg-gray-200 ${
        small ? "text-xs" : "text-sm"
      }`}
    >
      {label}
    </div>
  );
}
