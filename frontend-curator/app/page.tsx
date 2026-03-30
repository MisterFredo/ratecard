"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);

  const [topics, setTopics] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [visibleCompanies, setVisibleCompanies] = useState(0);

  // =========================
  // FETCH DATA (BQ)
  // =========================
  useEffect(() => {
    async function load() {
      try {
        const t = await api.get("/topic/list");
        const s = await api.get("/source/list");
        const c = await api.get("/company/list");

        setTopics(t.topics || []);
        setSources(s.sources || []);
        setCompanies(c.companies || []);
      } catch (e) {
        console.error("❌ LOAD ERROR", e);
      }
    }

    load();
  }, []);

  // =========================
  // ANIMATION ACTEURS (lent)
  // =========================
  useEffect(() => {
    if (step !== 2 || companies.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i += 1;
      setVisibleCompanies(i);
    }, 250); // 🔥 lent pour parler

    return () => clearInterval(interval);
  }, [step, companies]);

  // =========================
  // NAVIGATION
  // =========================
  function handleNext() {
    if (step === 3) {
      setSubStep((s) => Math.min(s + 1, 6));
    } else {
      setStep((s) => s + 1);
      setSubStep(0);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") handleNext();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div className="w-full min-h-screen bg-white px-10 py-16">

      {/* ========================= */}
      {/* STEP 0 — TOPICS */}
      {/* ========================= */}
      {step === 0 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Deux écosystèmes, un socle commun
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">

            <Column
              title="Foundations"
              color="bg-blue-50"
              border="border-blue-200"
              items={topics.filter(
                (t) => t.topic_axis === "FOUNDATIONS"
              )}
            />

            <Column
              title="Retail"
              color="bg-green-50"
              border="border-green-200"
              items={topics.filter(
                (t) => t.topic_axis === "RETAIL"
              )}
            />

            <Column
              title="Media"
              color="bg-purple-50"
              border="border-purple-200"
              items={topics.filter(
                (t) => t.topic_axis === "MEDIA"
              )}
            />

          </div>
        </>
      )}

      {/* ========================= */}
      {/* STEP 1 — SOURCES */}
      {/* ========================= */}
      {step === 1 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Des sources filtrées d'horizons différents
          </h1>

          <div className="grid grid-cols-5 gap-6 max-w-5xl mx-auto">

            {sources.slice(0, 30).map((s) => (
              <SourceLogo
                key={s.source_id}
                src={`${GCS_BASE_URL}/sources/${s.logo}`}
              />
            ))}

          </div>
        </>
      )}

      {/* ========================= */}
      {/* STEP 2 — ACTEURS */}
      {/* ========================= */}
      {step === 2 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Des centaines d’acteurs
          </h1>

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

      {/* ========================= */}
      {/* STEP 3 — BLOCS */}
      {/* ========================= */}
      {step === 3 && (
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3, 4, 5, 6]
            .slice(0, subStep)
            .map((i) => (
              <div
                key={i}
                className="p-6 border rounded-xl shadow-sm text-center"
              >
                Bloc {i}
              </div>
            ))}
        </div>
      )}

      {/* CONTROL */}
      <div className="flex justify-center mt-12">
        <button
          onClick={handleNext}
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
// COMPONENTS
// =========================
//

function Column({ title, items, color, border }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase text-gray-400 text-center">
        {title}
      </h2>

      <div className="flex flex-wrap justify-center gap-3">
        {items.map((t: any) => (
          <div
            key={t.id_topic}
            className={`px-4 py-2 rounded-lg text-sm border ${color} ${border}`}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceLogo({ src }: any) {
  return (
    <div className="w-full h-20 flex items-center justify-center bg-white border rounded-xl shadow-sm">
      <img
        src={src}
        alt=""
        className="max-w-[80%] max-h-[70%] object-contain"
      />
    </div>
  );
}

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
