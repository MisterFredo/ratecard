"use client";

import BrevesHeaderStats from "@/components/breves/BrevesHeaderStats";
import BrevesCompaniesPanel from "@/components/breves/BrevesCompaniesPanel";
import BrevesFeed from "@/components/breves/BrevesFeed";

export default function BrevesPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-black">

      <div className="max-w-6xl mx-auto px-8 py-16">

        {/* HEADER — MARKET OVERVIEW */}
        <BrevesHeaderStats />

        {/* ACTEURS DU MARCHÉ */}
        <BrevesCompaniesPanel />

        {/* FLUX PRINCIPAL */}
        <BrevesFeed />

      </div>

    </div>
  );
}

