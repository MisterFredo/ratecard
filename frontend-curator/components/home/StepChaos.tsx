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

      {/* ELEMENTS */}
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
              opacity: phase === "merge" ? 0.5 : 1,
            }}
          >
            <img
              src={src}
              className="w-16 h-10 object-contain"
            />
          </div>
        );
      })}

      {/* CONNECTIONS */}
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
              opacity="0.08"
            />
          ))}
        </svg>
      )}

      {/* LOGO FINAL */}
      {phase === "merge" && (
        <div className="absolute animate-fadeIn">
          <img
            src="/assets/brand/logo_stack_curator.png"
            className="w-56 mx-auto"
          />
        </div>
      )}
    </div>
  );
}
