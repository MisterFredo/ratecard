"use client";

import { useState } from "react";
import BrevesLiveBar from "@/components/breves/BrevesLiveBar";
import BrevesHeaderStats from "@/components/breves/BrevesHeaderStats";
import BrevesFilters from "@/components/breves/BrevesFilters";
import BrevesFeed from "@/components/breves/BrevesFeed";

export type Period = "total" | "7d" | "30d";

export default function BrevesPage() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>("7d");

  return (
    <div className="min-h-screen bg-white">

      {/* LIVE STRIP */}
      <BrevesLiveBar selectedPeriod={selectedPeriod} />

      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        <BrevesHeaderStats
          selectedPeriod={selectedPeriod}
          onChangePeriod={setSelectedPeriod}
        />

        <BrevesFilters
          selectedPeriod={selectedPeriod}
        />

        <BrevesFeed />

      </div>
    </div>
  );
}
