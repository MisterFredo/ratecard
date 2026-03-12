"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Result = {
  ID: string;
  TITLE: string;
  EXCERPT: string;
  SOURCE_TYPE: "NEWS" | "ANALYSIS";
  PUBLISHED_AT: string;
};

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await api.get("/search", {
        params: { q: query },
      });

      setResults(res.results || []);
    } catch (e) {
      console.error(e);
      alert("Erreur search");
    }

    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Search Test</h1>

      {/* Search bar */}
      <div className="flex gap-4">
        <input
          className="border px-3 py-2 w-96"
          placeholder="Search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={runSearch}
          className="bg-black text-white px-4 py-2"
        >
          Search
        </button>
      </div>

      {loading && <div>Loading...</div>}

      {/* Results */}
      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.ID} className="border p-4 rounded">
            <div className="flex justify-between">
              <div className="font-semibold">{r.TITLE}</div>
              <div className="text-sm text-gray-500">
                {r.SOURCE_TYPE}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-1">
              {new Date(r.PUBLISHED_AT).toLocaleDateString()}
            </div>

            <div className="text-sm mt-3 text-gray-700">
              {r.EXCERPT}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
