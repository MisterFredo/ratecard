"use client";

export default function StepUseCases({ subStep }: any) {
  const blocks = [
    "Préparer une présentation interne",
    "Préparer un rendez-vous fournisseur",
    "Analyser un concurrent",
    "Faire de la veille sur un sujet",
    "Structurer une formation",
    "Produire une analyse rapidement",
  ];

  return (
    <div className="max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-5xl font-semibold text-center mb-16 tracking-tight">
        Concrètement,
        <span className="block text-gray-400 font-normal">
          dans votre quotidien
        </span>
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-8">

        {blocks.slice(0, subStep).map((text, i) => (
          <div
            key={i}
            className="
              group
              p-8
              rounded-2xl
              border border-gray-200
              bg-white
              text-center

              transition-all duration-300

              hover:scale-105
              hover:shadow-xl
              hover:border-black
            "
          >
            <p className="
              text-base font-medium text-gray-800
              group-hover:text-black
              transition
            ">
              {text}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}
