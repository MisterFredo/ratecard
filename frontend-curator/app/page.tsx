"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [step, setStep] = useState(0);

  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH DATA (ALIGNÉ AVEC TON FEED)
  // =========================
  useEffect(() => {
    async function load() {
      try {
        const sourcesRes = await api.get("/source/list");
        const companiesRes = await api.get("/company/list");

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
  // CONTROLE CLAVIER (→)
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
  // RENDER
  // =========================
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-6">

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
      {step >= 0 && (
        <div className="flex flex-wrap gap-4 max-w-4xl justify-center">
          {sources.slice(0, step * 3 + 1).map((s) => (
            <Logo
              key={s.source_id}
              type="source"
              id={s.logo}
              label={s.name}
            />
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* COMPANIES */}
      {/* ========================= */}
      {step >= 3 && (
        <>
          <h2 className="text-2xl mt-10 mb-6 text-gray-600">
            Et des centaines d’acteurs
          </h2>

          <div className="flex flex-wrap gap-3 max-w-5xl justify-center">
            {companies.slice(0, (step - 2) * 10).map((c) => (
              <Logo
                key={c.id_company}
                type="company"
                id={c.media_logo_rectangle_id}
                label={c.name}
                small
              />
            ))}
          </div>
        </>
      )}

      {/* CONTROL */}
      <button
        onClick={() => setStep((s) => s + 1)}
        className="mt-10 px-6 py-3 bg-black text-white rounded-lg"
      >
        Next →
      </button>
    </div>
  );
}

//
// =========================
// LOGO COMPONENT (ROBUSTE)
// =========================
//

function Logo({ type, id, label, small = false }: any) {
  if (!id) {
    return (
      <Fallback label={label} small={small} />
    );
  }

  let src = "";

  if (type === "company") {
    src = `${GCS_BASE_URL}/companies/${id}`;
  } else {
    // ⚠️ Sources → on suppose que LOGO contient déjà le bon path
    src = `${GCS_BASE_URL}/${id}`;
  }

  return (
    <img
      src={src}
      alt={label}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
      className={`object-contain ${
        small ? "h-6" : "h-10"
      }`}
    />
  );
}

//
// =========================
// FALLBACK TEXTE
// =========================
//

function Fallback({ label, small }: any) {
  return (
    <div className="px-2 py-1 bg-gray-200 text-xs rounded">
      {label}
    </div>
  );
}
