"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [step, setStep] = useState(0);

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
  // KEYBOARD CONTROL (🔥 important)
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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">

      <h1 className="text-4xl font-bold mb-10">
        L’information est partout
      </h1>

      {/* ========================= */}
      {/* STEP 0 → SOURCES */}
      {/* ========================= */}
      {step >= 0 && (
        <div className="flex flex-wrap gap-4 max-w-4xl justify-center">
          {sources.slice(0, step * 3 + 1).map((s) => (
            <Logo
              key={s.source_id}
              src={`${GCS_BASE_URL}/${s.logo}`}
            />
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* STEP 3 → COMPANIES */}
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
                src={`${GCS_BASE_URL}/${c.media_logo_rectangle_id}`}
                small
              />
            ))}
          </div>
        </>
      )}

      {/* CONTROL BUTTON */}
      <button
        onClick={() => setStep((s) => s + 1)}
        className="mt-10 px-6 py-2 bg-black text-white rounded"
      >
        Next →
      </button>
    </div>
  );
}

// =========================
// LOGO COMPONENT
// =========================

function Logo({ src, small = false }: any) {
  if (!src) return null;

  return (
    <img
      src={src}
      className={`object-contain ${
        small ? "h-6" : "h-10"
      }`}
      alt=""
    />
  );
}
