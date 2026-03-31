"use client";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

export default function StepSources({ sources }: any) {
  const formats = [
    { label: "Articles", value: 4600 },
    { label: "Analyses", value: 1050 },
    { label: "Interviews", value: 420 },
    { label: "Podcasts", value: 285 },
    { label: "Vidéos", value: 140 },
    { label: "Événements", value: 260 },
    { label: "Tribunes", value: 510 },
    { label: "Posts LinkedIn", value: 2500 },
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
        opacity-15
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
            rendues structurées et exploitables
          </span>
        </h1>

        {/* FORMATS */}
        <div className="max-w-3xl mx-auto space-y-5">

          {formats.map((f, i) => (
            <div key={i}>

              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-800">
                  {f.label}
                </span>

                <span className="text-lg font-semibold text-gray-900">
                  {f.value}
                </span>
              </div>

              <div className="mt-2 h-[3px] bg-gray-100 rounded">
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${Math.min(f.value / 15, 100)}%`,
                  }}
                />
              </div>

            </div>
          ))}

        </div>

        {/* ========================= */}
        {/* NUMBERS TO REMEMBER */}
        {/* ========================= */}
        <div className="mt-20 text-center">

          <div className="text-sm uppercase tracking-widest text-gray-400 mb-6">
            Quelle exploitation dans GetCurator ?
          </div>

          <div className="flex justify-center gap-16">

            <div>
              <div className="text-3xl font-semibold text-gray-900">
                2 466
              </div>
              <div className="text-sm text-gray-500 mt-1">
                analyses
              </div>
            </div>

            <div>
              <div className="text-3xl font-semibold text-gray-900">
                928
              </div>
              <div className="text-sm text-gray-500 mt-1">
                news
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
