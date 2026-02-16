"use client";

import BrevesHeaderStats from "@/components/breves/BrevesHeaderStats";
import BrevesFilters from "@/components/breves/BrevesFilters";
import BrevesFeed from "@/components/breves/BrevesFeed";

export default function BrevesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-14 space-y-14">

        {/* HEADER MARKET STYLE */}
        <BrevesHeaderStats />

        {/* FILTER BAR */}
        <BrevesFilters />

        {/* MAIN FEED */}
        <BrevesFeed />

      </div>
    </div>
  );
}
