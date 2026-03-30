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
  // CONTROL (flèche droite)
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

  return (
    <div className="w-full min-h-screen bg-white px-8 py-16">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-center mb-12">
        L’information est partout
      </h1>

      {/* ========================= */}
      {/* SOURCES */}
      {/* ========================= */}
      <div className="flex flex-wrap justify-center items-start gap-4 w-full max-w-6xl mx-auto">

        {sources.slice(0, step * 2 + 1).map((s) => (
          <Logo
            key={s.source_id}
            src={`${GCS_BASE_URL}/sources/${s.logo}`}
          />
        ))}

      </div>

      {/* ========================= */}
      {/* COMPANIES */}
      {/* ========================= */}
      {step >= 5 && (
        <>
          <h2 className="text-2xl text-center mt-16 mb-8 text-gray-600">
            Et des centaines d’acteurs
          </h2>

          <div className="flex flex-wrap justify-center items-start gap-3 w-full max-w-6xl mx-auto">

            {companies.slice(0, (step - 4) * 6).map((c) => (
              <Logo
                key={c.id_company}
                src={`${GCS_BASE_URL}/companies/${c.media_logo_rectangle_id}`}
                small
              />
            ))}

          </div>
        </>
      )}

      {/* CONTROL */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => setStep((s) => s + 1)}
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Next →
        </button>
      </div>

    </div>
  );
}

//
// =========================
// LOGO COMPONENT
// =========================
//

function Logo({ src, small = false }: any) {
  return (
    <div
      className={`
        flex items-center justify-center
        bg-white border rounded-lg
        ${small ? "w-16 h-10" : "w-24 h-14"}
      `}
    >
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
