"use client";

import BrevesSwitcher from "@/components/breves/BrevesSwitcher";
import BrevesFeed from "@/components/breves/BrevesFeed";

export default function BrevesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <BrevesSwitcher />
        <BrevesFeed />
      </div>
    </div>
  );
}
