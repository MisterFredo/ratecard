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

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}
      <h1 className="text-5xl font-semibold text-center mb-20 tracking-tight">
        Concrètement,
        <span className="block text-gray-400 font-normal">
          dans votre quotidien
        </span>
      </h1>

      {/* ========================= */}
      {/* BLOCKS */}
      {/* ========================= */}
      <div className="grid grid-cols-3 gap-6">

        {blocks.slice(0, subStep).map((text, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border bg-white hover:shadow-md transition"
          >
            <p className="text-sm font-medium">
              {text}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}
