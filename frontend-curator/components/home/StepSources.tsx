"use client";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function StepSources({ sources }: any) {
  return (
    <div className="max-w-6xl mx-auto">

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}
      <h1 className="text-5xl font-semibold text-center mb-20 tracking-tight">
        Des sources filtrées
        <span className="block text-gray-400 font-normal">
          d'horizons différents
        </span>
      </h1>

      {/* ========================= */}
      {/* LOGO CLOUD */}
      {/* ========================= */}
      <div className="flex flex-wrap justify-center gap-10">

        {sources.slice(0, 40).map((s: any, i: number) => {
          const size =
            i % 5 === 0
              ? "w-28 h-20"
              : i % 3 === 0
              ? "w-24 h-16"
              : "w-20 h-14";

          return (
            <div
              key={s.source_id}
              className={`
                flex items-center justify-center
                ${size}
                opacity-80 hover:opacity-100
                transition duration-300
              `}
            >
              <img
                src={`${GCS_BASE_URL}/sources/${s.logo}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          );
        })}

      </div>

    </div>
  );
}
