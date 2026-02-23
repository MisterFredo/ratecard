"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Topic = {
  id_topic: string;
  label: string;
};

type Company = {
  id_company: string;
  name: string;
};

type NewsType = {
  code: string;
  label: string;
};

type Props = {
  onSearch: (filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
  }) => void;
};

export default function DigestEngine({ onSearch }: Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [types, setTypes] = useState<NewsType[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadReferentials() {
      const t = await api.get("/topic/list");
      const c = await api.get("/company/list");
      const nt = await api.get("/news/types");

      setTopics(t.topics || []);
      setCompanies(c.companies || []);
      setTypes(nt.types || []);
    }

    loadReferentials();
  }, []);

  function toggleValue(
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  }

  async function handleSearch() {
    setLoading(true);

    await onSearch({
      topics: selectedTopics,
      companies: selectedCompanies,
      news_types: selectedTypes,
    });

    setLoading(false);
  }

  return (
    <div className="space-y-6 border rounded-lg p-6 bg-white">

      <h2 className="text-sm font-semibold">
        Moteur éditorial
      </h2>

      {/* TOPICS */}
      <div>
        <p className="text-xs font-medium mb-2">Topics</p>
        <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
          {topics.map((t) => (
            <label key={t.id_topic} className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedTopics.includes(t.id_topic)}
                onChange={() =>
                  toggleValue(t.id_topic, selectedTopics, setSelectedTopics)
                }
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* COMPANIES */}
      <div>
        <p className="text-xs font-medium mb-2">Sociétés</p>
        <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
          {companies.map((c) => (
            <label key={c.id_company} className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedCompanies.includes(c.id_company)}
                onChange={() =>
                  toggleValue(
                    c.id_company,
                    selectedCompanies,
                    setSelectedCompanies
                  )
                }
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      {/* TYPES */}
      <div>
        <p className="text-xs font-medium mb-2">Types</p>
        <div className="space-y-1 text-sm">
          {types.map((t) => (
            <label key={t.code} className="flex gap-2">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t.code)}
                onChange={() =>
                  toggleValue(t.code, selectedTypes, setSelectedTypes)
                }
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="px-4 py-2 rounded bg-black text-white text-sm"
      >
        {loading ? "Recherche…" : "Rechercher"}
      </button>
    </div>
  );
}
