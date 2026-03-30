"use client";

export default function StepUseCases() {
  const useCases = [
    { text: "Préparer une présentation interne", angle: 0 },
    { text: "Analyser un concurrent", angle: 60 },
    { text: "Faire de la veille sur un sujet", angle: 120 },
    { text: "Produire une analyse rapidement", angle: 180 },
    { text: "Structurer une formation", angle: 240 },
    { text: "Préparer un rendez-vous fournisseur", angle: 300 },
  ];

  const radius = 240;

  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">

      {/* ========================= */}
      {/* CENTER LOGO */}
      {/* ========================= */}
      <div className="absolute z-20 text-center">
        <img
          src="/assets/brand/logo_stack_curator.png"
          className="w-48 mx-auto"
        />
      </div>

      {/* ========================= */}
      {/* CONNECTION LINES */}
      {/* ========================= */}
      <svg className="absolute w-full h-full pointer-events-none">
        {useCases.map((_, i) => {
          const angle = (useCases[i].angle * Math.PI) / 180;

          const x2 = Math.cos(angle) * radius;
          const y2 = Math.sin(angle) * radius;

          return (
            <line
              key={i}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${x2}px)`}
              y2={`calc(50% + ${y2}px)`}
              stroke="#bbb"
              strokeWidth="1"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#bbb" />
          </marker>
        </defs>
      </svg>

      {/* ========================= */}
      {/* USE CASES */}
      {/* ========================= */}
      {useCases.map((u, i) => {
        const angle = (u.angle * Math.PI) / 180;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            className="
              absolute z-10
              px-6 py-3
              rounded-full
              border border-gray-200
              bg-white
              text-sm

              shadow-sm
              transition-all duration-300

              hover:scale-105 hover:shadow-md hover:border-gray-300
            "
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {u.text}
          </div>
        );
      })}
    </div>
  );
}
