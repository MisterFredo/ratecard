"use client";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function StepSources({ sources }: any) {
  const formats = [
    { label: "Posts LinkedIn", rhythm: "plusieurs fois par jour" },
    { label: "Articles", rhythm: "quotidien" },
    { label: "Analyses", rhythm: "hebdomadaire" },
    { label: "Tribunes", rhythm: "hebdomadaire" },
    { label: "Podcasts", rhythm: "hebdomadaire" },
    { label: "Rapports marchés", rhythm: "en continu" },
    { label: "Interviews", rhythm: "en continu" },
    { label: "Vidéos", rhythm: "en continu" },
    { label: "Événements", rhythm: "en continu" },
  ];

  return (
    <div className="relative max-w-6xl mx-auto">

      {/* ========================= */}
      {/* BACKGROUND LOGOS */}
      {/* ========================= */}
      <div className="
        absolute bottom-0 left-0 right-0
        h-[60%]
        flex flex-wrap justify-center gap-10
        opacity-10
        pointer-events-none
      ">
        {sources.slice(0, 40).map((s: any, i: number) => (
          <img
            key={s.source_id}
            src={`${GCS_BASE_URL}/sources/${s.logo}`}
            className="w-20 h-14 object-contain"
            style={{
              transform: `translateY(${Math.sin(i) * 10}px)`
            }}
          />
        ))}
      </div>

      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}
      <div className="relative z-10">

        {/* TITLE */}
        <h1 className="text-5xl font-semibold text-center mb-20 tracking-tight">
          Des sources multiples et de qualité hétérogène
          <span className="block text-gray-400 font-normal">
            nécessitent un tri et une lecture en continu
          </span>
        </h1>

        {/* FORMATS */}
        <div className="max-w-2xl mx-auto space-y-4">

          {formats.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b pb-2"
            >
              <span
                className={`
                  text-lg
                  ${
                    i === 0
                      ? "text-gray-900 font-semibold"
                      : i < 3
                      ? "text-gray-700"
                      : "text-gray-500"
                  }
                `}
              >
                {f.label}
              </span>

              <span className="text-sm text-gray-500 italic">
                {f.rhythm}
              </span>
            </div>
          ))}

        </div>

        {/* ========================= */}
        {/* TRANSITION MESSAGE */}
        {/* ========================= */}
        <div className="mt-16 text-center max-w-2xl mx-auto text-gray-600 text-sm leading-relaxed">
          Une fois les sources identifiées, le vrai enjeu devient le tri :
          filtrer, qualifier et comprendre des flux continus d’informations.
        </div>

        {/* ========================= */}
        {/* RESULT (DATA CURATOR) */}
        {/* ========================= */}
        <div className="mt-20 text-center">

          <div className="text-sm uppercase tracking-widest text-gray-400 mb-6">
            Ce que nous avons extrait avec GetCurator :
          </div>

          <div className="flex justify-center gap-16">

            <div>
              <div className="text-3xl font-semibold text-gray-900">
                2 466
              </div>
              <div className="text-sm text-gray-500 mt-1">
                analyses qualifiées
              </div>
            </div>

            <div>
              <div className="text-3xl font-semibold text-gray-900">
                928
              </div>
              <div className="text-sm text-gray-500 mt-1">
                signaux marché (news)
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
