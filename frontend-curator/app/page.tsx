"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4500),
      setTimeout(() => setStep(4), 6000),
      setTimeout(() => router.push("/feed"), 7500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-white">

      <h1 className="text-4xl font-bold mb-8 text-center">
        Trop d’information, pas assez de signal
      </h1>

      {/* CHAOS */}
      <div className={`flex gap-3 flex-wrap max-w-3xl justify-center transition-all duration-700 ${step > 2 ? "opacity-20 scale-95" : "opacity-100"}`}>
        {["Amazon", "Walmart", "LinkedIn", "YouTube", "TikTok", "+45%", "insight", "study", "podcast"].map((item, i) => (
          <div key={i} className="px-3 py-1 bg-gray-200 rounded-md text-sm">
            {item}
          </div>
        ))}
      </div>

      {/* FILTER */}
      {step >= 2 && (
        <div className="flex gap-6 mt-6 text-sm text-gray-600 animate-fade-in">
          <div>Qualité</div>
          <div>Redondance</div>
          <div>Structuration</div>
        </div>
      )}

      {/* ANALYSIS */}
      {step >= 3 && (
        <div className="flex gap-6 mt-10">
          <Card title="Commerce agentique" subtitle="Transformation du funnel" />
          <Card title="Amazon Ads" subtitle="+ croissance revenus" />
          <Card title="Walmart" subtitle="Montée marketplace" />
        </div>
      )}

      {/* CTA */}
      {step >= 4 && (
        <button
          onClick={() => router.push("/feed")}
          className="mt-10 px-6 py-3 bg-black text-white rounded-lg"
        >
          Entrer dans Curator
        </button>
      )}
    </div>
  );
}

function Card({ title, subtitle }: any) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 w-48">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}
