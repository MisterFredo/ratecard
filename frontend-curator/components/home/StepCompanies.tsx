"use client";

import { useEffect, useState } from "react";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function StepCompanies({ companies }: any) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      i += 2; // un peu plus rapide et naturel
      setVisible(i);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-[70vh] flex flex-col justify-start items-center bg-gradient-to-b from-white to-gray-50">

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}
      <h1 className="text-5xl font-semibold text-center mb-16 tracking-tight">
        Des centaines d'acteurs
        <span className="block text-gray-400 font-normal">
          AdTech, Agences, Annonceurs, MarTech, Média, Plateformes, Retailers
        </span>
      </h1>

      {/* ========================= */}
      {/* LOGOS */}
      {/* ========================= */}
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">

        {companies.slice(0, visible).map((c: any, i: number) => (
          <div
            key={c.id_company}
            className={`
              flex items-center justify-center
              w-16 h-10
              opacity-0 scale-90
              animate-fadeIn
            `}
            style={{
              animationDelay: `${i * 0.01}s`,
            }}
          >
            <img
              src={`${GCS_BASE_URL}/companies/${c.media_logo_rectangle_id}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}

      </div>

    </div>
  );
}
