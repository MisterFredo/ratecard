import { useState, useEffect } from "react";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

// =========================
// FETCH SERVER SIDE
// =========================
async function getData() {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const [t, s, c] = await Promise.all([
    fetch(`${base}/topic/list`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/source/list`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/company/list`, { cache: "no-store" }).then(r => r.json())
  ]);

  return {
    topics: t.topics || [],
    sources: s.sources || [],
    companies: c.companies || []
  };
}

// =========================
// PAGE (SERVER + CLIENT HYBRID)
// =========================
export default async function Home() {
  const data = await getData();

  return <HomeClient {...data} />;
}

// =========================
// CLIENT PART (INTERACTION)
// =========================
function HomeClient({ topics, sources, companies }: any) {
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);

  const [visibleCompanies, setVisibleCompanies] = useState(0);

  // =========================
  // ACTEURS ANIMATION
  // =========================
  useEffect(() => {
    if (step !== 2) return;

    let i = 0;

    const interval = setInterval(() => {
      i += 1;
      setVisibleCompanies(i);
    }, 250);

    return () => clearInterval(interval);
  }, [step]);

  // =========================
  // NAV
  // =========================
  function handleNext() {
    if (step === 4) {
      setSubStep(s => Math.min(s + 1, 6));
    } else {
      setStep(s => s + 1);
      setSubStep(0);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white px-10 py-16">

      {/* STEP 0 */}
      {step === 0 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Deux écosystèmes, un socle commun
          </h1>

          <div className="grid grid-cols-3 gap-10 max-w-6xl mx-auto">
            <Column title="Foundations" items={topics.filter(t => t.topic_axis === "FOUNDATIONS")} color="bg-blue-50" />
            <Column title="Retail" items={topics.filter(t => t.topic_axis === "RETAIL")} color="bg-green-50" />
            <Column title="Media" items={topics.filter(t => t.topic_axis === "MEDIA")} color="bg-purple-50" />
          </div>
        </>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Des sources filtrées d'horizons différents
          </h1>

          <div className="grid grid-cols-5 gap-6 max-w-5xl mx-auto">
            {sources.slice(0, 30).map((s: any) => (
              <SourceLogo key={s.source_id} src={`${GCS_BASE_URL}/sources/${s.logo}`} />
            ))}
          </div>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h1 className="text-4xl font-bold text-center mb-16">
            Des centaines d’acteurs
          </h1>

          <div className="flex flex-wrap justify-center gap-3 max-w-6xl mx-auto">
            {companies.slice(0, visibleCompanies).map((c: any) => (
              <Logo key={c.id_company} src={`${GCS_BASE_URL}/companies/${c.media_logo_rectangle_id}`} small />
            ))}
          </div>
        </>
      )}

      {/* STEP 3 CHAOS */}
      {step === 3 && (
        <ChaosScene
          companies={companies.slice(0, 40)}
          sources={sources.slice(0, 10)}
          topics={topics.slice(0, 10)}
        />
      )}

      {/* STEP 4 BLOCS */}
      {step === 4 && (
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1,2,3,4,5,6].slice(0, subStep).map(i => (
            <div key={i} className="p-6 border rounded-xl text-center">
              Bloc {i}
            </div>
          ))}
        </div>
      )}

      {/* CONTROL */}
      <div className="flex justify-center mt-12">
        <button onClick={handleNext} className="px-6 py-3 bg-black text-white rounded-lg">
          Next →
        </button>
      </div>
    </div>
  );
}

//
// =========================
// CHAOS FIX (VISIBLE)
// =========================
//

function ChaosScene({ companies, sources, topics }: any) {
  const items = [...companies, ...sources, ...topics];

  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center">

      {items.map((item, i) => {
        const isCompany = item.id_company;
        const isSource = item.source_id;

        const src = isCompany
          ? `${GCS_BASE_URL}/companies/${item.media_logo_rectangle_id}`
          : isSource
          ? `${GCS_BASE_URL}/sources/${item.logo}`
          : null;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              transform: randomPosition(i),
            }}
          >
            {src ? (
              <img src={src} className="w-14 h-10 object-contain" />
            ) : (
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                {item.label}
              </div>
            )}
          </div>
        );
      })}

      {/* LOGO */}
      <div className="absolute bottom-10 text-center">
        <img
          src="/assets/brand/getcurator-logo.png"
          className="w-40 mx-auto"
        />
      </div>
    </div>
  );
}

function randomPosition(i: number) {
  const x = Math.cos(i * 23) * 200;
  const y = Math.sin(i * 17) * 200;
  return `translate(${x}px, ${y}px)`;
}

//
// =========================
// COMPONENTS
// =========================
//

function Column({ title, items, color }: any) {
  return (
    <div>
      <h2 className="text-sm text-center text-gray-400 mb-4">{title}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((t: any) => (
          <div key={t.id_topic} className={`px-3 py-1 rounded ${color}`}>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceLogo({ src }: any) {
  return (
    <div className="h-20 flex items-center justify-center border rounded-xl">
      <img src={src} className="max-h-[60%]" />
    </div>
  );
}

function Logo({ src, small }: any) {
  return (
    <div className={`${small ? "w-16 h-10" : "w-24 h-14"} flex items-center justify-center border rounded`}>
      <img src={src} className="max-h-full" />
    </div>
  );
}
