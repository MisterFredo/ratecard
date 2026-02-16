"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type TopicStat = {
  id_topic: string;
  label: string;
  total: number;
};

type TypeStat = {
  news_type?: string | null;
  total: number;
};

export default function BrevesFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [topics, setTopics] = useState<TopicStat[]>([]);
  const [types, setTypes] = useState<TypeStat[]>([]);

  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${API_BASE}/news/breves/stats`,
        { cache: "no-store" }
      );

      if (!res.ok) return;
      const json = await res.json();

      setTopics(json.topics_stats || []);
      setTypes(json.types_stats || []);
    }

    load();
  }, []);

  function toggleFilter(
    key: "topics" | "news_types",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(key);

    if (values.includes(value)) {
      params.delete(key);
      values
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    router.push(`/breves?${params.toString()}`);
  }

  return (
    <section className="space-y-6">

      {/* TYPES */}
      <div className="flex flex-wrap gap-3">
        {types.map((t) => {
          const active = selectedTypes.includes(
            t.news_type || ""
          );

          return (
            <button
              key={t.news_type || "null"}
              onClick={() =>
                toggleFilter(
                  "news_types",
                  t.news_type || ""
                )
              }
              className={`px-3 py-1 text-xs rounded-full border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              {t.news_type || "Autre"} ({t.total})
            </button>
          );
        })}
      </div>

      {/* TOPICS */}
      <div className="flex flex-wrap gap-3">
        {topics.slice(0, 15).map((t) => {
          const active = selectedTopics.includes(
            t.id_topic
          );

          return (
            <button
              key={t.id_topic}
              onClick={() =>
                toggleFilter("topics", t.id_topic)
              }
              className={`px-3 py-1 text-xs rounded-full border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              {t.label} ({t.total})
            </button>
          );
        })}
      </div>

    </section>
  );
}
