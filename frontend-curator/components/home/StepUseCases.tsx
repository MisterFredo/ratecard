"use client";

export default function StepUseCases() {
  const useCases = [
    "Préparer une présentation interne",
    "Analyser un concurrent",
    "Faire de la veille sur un sujet",
    "Produire une analyse rapidement",
    "Structurer une formation",
    "Préparer un rendez-vous fournisseur",
  ];

  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">

      {/* ========================= */}
      {/* CENTER LOGO */}
      {/* ========================= */}
      <div className="absolute z-10 text-center">
        <img
          src="/assets/brand/logo_stack_curator.png"
          className="w-48 mx-auto mb-4"
        />
      </div>

      {/* ========================= */}
      {/* USE CASES AROUND */}
      {/* ========================= */}
      {useCases.map((text, i) => {
        const angle = (i / useCases.length) * Math.PI * 2;
        const radius = 220;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={i}
            className="
              absolute
              px-5 py-3
              rounded-xl
              border border-gray-200
              bg-white
              text-sm text-center

              transition-all duration-300

              hover:scale-105 hover:shadow-lg
            "
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {text}
          </div>
        );
      })}

    </div>
  );
}
