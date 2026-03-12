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
  const [error, setError] = useState<string | null>(null);

  async function runSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(
        `/search?q=${encodeURIComponent(query)}`
      );

      setResults(res.results || []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur search");
      setResults([]);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="text-sm text-gray-500 mt-1">
          Test du moteur full-text BigQuery (NEWS + ANALYSES)
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-4">
        <input
          className="border px-4 py-2 w-[400px] rounded"
          placeholder="Ex: retail media, Amazon clean room..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
        />

        <button
          onClick={runSearch}
          className="bg-ratecard-blue text-white px-5 py-2 rounded hover:opacity-90"
        >
          Search
        </button>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-sm text-gray-500">Recherche en cours…</div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-5">
        {results.map((r) => (
          <div
            key={`${r.SOURCE_TYPE}-${r.ID}`}
            className="bg-white border rounded p-5 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="font-semibold text-lg">
                {r.TITLE}
              </div>

              <div
                className={`text-xs px-2 py-1 rounded ${
                  r.SOURCE_TYPE === "NEWS"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {r.SOURCE_TYPE}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-1">
              {new Date(r.PUBLISHED_AT).toLocaleDateString()}
            </div>

            {r.EXCERPT && (
              <div className="text-sm text-gray-700 mt-3">
                {r.EXCERPT}
              </div>
            )}
          </div>
        ))}

        {!loading && results.length === 0 && query && !error && (
          <div className="text-sm text-gray-500">
            Aucun résultat trouvé.
          </div>
        )}
      </div>
    </div>
  );
}
