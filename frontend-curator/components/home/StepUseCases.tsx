"use client";

export default function StepUseCases() {
  const useCases = [
    { text: "Structurer une formation", x: 0, y: -180 },
    { text: "Préparer un rendez-vous", x: 160, y: -120 },
    { text: "Concevoir une présentation", x: 200, y: 0 },
    { text: "Analyser concurrentielle", x: 160, y: 120 },
    { text: "Piloter une veille", x: 0, y: 180 },
    { text: "Produire une analyse", x: -200, y: 0 },
  ];

  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">

      {/* ========================= */}
      {/* CENTER (IDENTIQUE AU CHAOS) */}
      {/* ========================= */}
      <div className="absolute z-20 text-center">
        <img
          src="/assets/brand/logo_stack_curator.png"
          className="w-56 mx-auto"
        />
      </div>

      {/* ========================= */}
      {/* SOFT FLOW (PAS DE FLÈCHES) */}
      {/* ========================= */}
      <svg className="absolute w-full h-full pointer-events-none">
        {useCases.map((u, i) => (
          <path
            key={i}
            d={`
              M 50% 50%
              Q ${50 + u.x / 4}% ${50 + u.y / 4}%
              ${50 + u.x / 2}% ${50 + u.y / 2}%
            `}
            stroke="#d1d5db"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
        ))}
      </svg>

      {/* ========================= */}
      {/* USE CASES (PREMIUM CARDS) */}
      {/* ========================= */}
      {useCases.map((u, i) => (
        <div
          key={i}
          className="
            absolute z-10

            px-6 py-3
            rounded-xl

            bg-white/80 backdrop-blur
            border border-gray-200

            text-sm text-gray-800

            shadow-[0_8px_20px_rgba(0,0,0,0.04)]

            transition-all duration-300

            hover:scale-105
            hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
          "
          style={{
            transform: `translate(${u.x}px, ${u.y}px)`,
          }}
        >
          {u.text}
        </div>
      ))}
    </div>
  );
}
