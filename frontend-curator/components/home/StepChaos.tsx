"use client";

import { useEffect, useState } from "react";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function StepChaos({ companies, sources }: any) {
  const [phase, setPhase] = useState("scatter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("connect"), 2000);
    const t2 = setTimeout(() => setPhase("merge"), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const items = [...companies.slice(0, 40), ...sources.slice(0, 20)];

  return (
    <div className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-100">

      {/* ========================= */}
      {/* ELEMENTS */}
      {/* ========================= */}
      {items.map((item, i) => {
        const isCompany = item.id_company;

        const src = isCompany
          ? `${GCS_BASE_URL}/companies/${item.media_logo_rectangle_id}`
          : `${GCS_BASE_URL}/sources/${item.logo}`;

        return (
          <div
            key={i}
            className="absolute transition-all duration-1000"
            style={{
              transform: spiralTransform(i, phase),
              opacity: phase === "merge" ? 0 : 1, // 🔥 disparition totale au merge
            }}
          >
            <img
              src={src}
              className="w-16 h-10 object-contain"
            />
          </div>
        );
      })}

      {/* ========================= */}
      {/* CONNECTIONS */}
      {/* ========================= */}
      {phase !== "scatter" && (
        <svg className="absolute w-full h-full pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <line
              key={i}
              x1={Math.random() * 100 + "%"}
              y1={Math.random() * 100 + "%"}
              x2={Math.random() * 100 + "%"}
              y2={Math.random() * 100 + "%"}
              stroke="#bbb"
              strokeWidth="1"
              opacity={phase === "merge" ? 0 : 0.08} // 🔥 fade des lignes aussi
            />
          ))}
        </svg>
      )}

      {/* ========================= */}
      {/* LOGO FINAL (HERO) */}
      {/* ========================= */}
      {phase === "merge" && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            animation: "zoomIn 1.2s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          <img
            src="/assets/brand/logo_stack_curator.jpeg"
            className="w-64 mx-auto"
          />
        </div>
      )}
    </div>
  );
}

/* ========================= */
/* SPIRAL TRANSFORM */
/* ========================= */

function spiralTransform(i: number, phase: string) {
  const angle = i * 0.5;

  const radius =
    phase === "scatter"
      ? 300 + i * 2
      : phase === "connect"
      ? 180 + i
      : 60; // 🔥 encore plus serré avant disparition

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return `translate(${x}px, ${y}px)`;
}
