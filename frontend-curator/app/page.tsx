"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function Home() {
  const [step, setStep] = useState(0);

  const [topics, setTopics] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [visibleSources, setVisibleSources] = useState(0);
  const [visibleCompanies, setVisibleCompanies] = useState(0);

  // =========================
  // FETCH REAL DATA
  // =========================
  useEffect(() => {
    async function load() {
      try {
        const t = await api.get("/topic/list");
        const s = await api.get("/source/list");
        const c = await api.get("/company/list");

        console.log("TOPICS →", t);
        console.log("SOURCES →", s);
        console.log("COMPANIES →", c);

        setTopics(t?.topics || t || []);
        setSources(s?.sources || s || []);
        setCompanies(c?.companies || c || []);
      } catch (e) {
        console.error("❌ LOAD ERROR", e);
      }
    }

    load();
  }, []);

  // =========================
  // ANIMATION SOURCES
  // =========================
  useEffect(() => {
    if (step !== 1 || sources.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i += 1;
      setVisibleSources(i);

      if (i >= sources.length) clearInterval(interval);
    }, 120);

    return () => clearInterval(interval);
  }, [step, sources]);

  // =========================
  // ANIMATION COMPANIES
  // =========================
  useEffect(() => {
    if (step !== 2 || companies.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i += Math.max(1, Math.floor(i / 15));
      setVisibleCompanies(i);
    }, 150);

    return () => clearInterval(interval);
  }, [step, companies]);

  // =========================
  // NAV
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
    <div className="w-full min-h-screen bg-white px-10 py-16">

      {/* ========================= */}
      {/* STEP 0 — TOPICS */}
      {/* ========================= */}
      {step === 0 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-12">
            Sujets traités
          </h1>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {topics.map((t: any) => (
              <div
                key={t.id_topic || t.ID_TOPIC}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                <div className="font-semibold">
                  {t.label || t.LABEL}
                </div>
                <div className="text-gray-400 text-xs">
                  {t.topic_axis || t.TOPIC_AXIS}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========================= */}
      {/* STEP 1 — SOURCES */}
      {/* ========================= */}
      {step === 1 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-12">
            L’information est partout
          </h1>

          <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
            {sources.slice(0, visibleSources).map((s: any) => (
              <Logo
                key={s.source_id}
                src={`${GCS_BASE_URL}/sources/${s.logo}`}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================= */}
      {/* STEP 2 — COMPANIES */}
      {/* ========================= */}
      {step === 2 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-12">
            Des centaines d’acteurs
          </h1>

          <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
            {companies.slice(0, visibleCompanies).map((c: any) => (
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
      {/* STEP 3 — CARDS */}
      {/* ========================= */}
      {step === 3 && (
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
          onClick={() => setStep((s) => s + 1)}
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// =========================
// LOGO
// =========================

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
