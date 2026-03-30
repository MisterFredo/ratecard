"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [visibleSources, setVisibleSources] = useState(0);
  const [visibleCompanies, setVisibleCompanies] = useState(0);

  const [phase, setPhase] = useState<"sources" | "companies">("sources");

  const [speed, setSpeed] = useState(40); // 🔥 vitesse ajustable

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    async function load() {
      const sourcesRes = await api.get("/source/list");
      const companiesRes = await api.get("/company/list");

      setSources(sourcesRes.sources || []);
      setCompanies(companiesRes.companies || []);
    }

    load();
  }, []);

  // =========================
  // ANIMATION SOURCES
  // =========================
  useEffect(() => {
    if (phase !== "sources" || sources.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i += Math.max(1, Math.floor(i / 10)); // 🔥 accélération progressive

      setVisibleSources(i);

      if (i >= sources.length) {
        clearInterval(interval);
        setPhase("companies");
      }
    }, speed);

    return () => clearInterval(interval);
  }, [sources, phase, speed]);

  // =========================
  // ANIMATION COMPANIES
  // =========================
  useEffect(() => {
    if (phase !== "companies" || companies.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i += Math.max(2, Math.floor(i / 8));

      setVisibleCompanies(i);

      if (i >= companies.length) {
        clearInterval(interval);
      }
    }, speed / 2); // 🔥 plus rapide

    return () => clearInterval(interval);
  }, [companies, phase, speed]);

  // =========================
  // CONTROL TEMPO (CLAVIER)
  // =========================
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") {
        setSpeed((s) => Math.max(10, s - 10)); // + rapide
      }
      if (e.key === "ArrowDown") {
        setSpeed((s) => s + 10); // + lent
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white px-8 py-16">

      <h1 className="text-4xl font-bold text-center mb-12">
        L’information est partout
      </h1>

      {/* ========================= */}
      {/* SOURCES */}
      {/* ========================= */}
      <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">

        {sources.slice(0, visibleSources).map((s) => (
          <Logo
            key={s.source_id}
            src={`${GCS_BASE_URL}/sources/${s.logo}`}
          />
        ))}

      </div>

      {/* ========================= */}
      {/* COMPANIES */}
      {/* ========================= */}
      {phase === "companies" && (
        <>
          <h2 className="text-2xl text-center mt-16 mb-8 text-gray-600">
            Et des centaines d’acteurs
          </h2>

          <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">

            {companies.slice(0, visibleCompanies).map((c) => (
              <Logo
                key={c.id_company}
                src={`${GCS_BASE_URL}/companies/${c.media_logo_rectangle_id}`}
                small
              />
            ))}

          </div>
        </>
      )}

    </div>
  );
}

//
// =========================
// LOGO
// =========================
//

function Logo({ src, small = false }: any) {
  return (
    <div
      className={`flex items-center justify-center border rounded-lg bg-white
      ${small ? "w-16 h-10" : "w-24 h-14"}`}
    >
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
