"use client";

import BrevesLiveBar from "@/components/breves/BrevesLiveBar";
import BrevesHeaderStats from "@/components/breves/BrevesHeaderStats";
import BrevesFilters from "@/components/breves/BrevesFilters";
import BrevesFeed from "@/components/breves/BrevesFeed";

export default function BrevesPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* LIVE STRIP */}
      <BrevesLiveBar />

      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        <BrevesHeaderStats />

        <BrevesFilters />

        <BrevesFeed />

      </div>
    </div>
  );
}
