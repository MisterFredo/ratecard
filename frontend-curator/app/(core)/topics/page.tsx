"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import TopicCard from "@/components/topics/TopicCard";

export const dynamic = "force-dynamic";

/* ========================================================= */

type Topic = {
  id_topic: string;
  label: string;
  topic_axis: string;

  nb_analyses: number;
  delta_30d: number;
};

type SortMode = "alpha" | "activity" | "growth";

/* ========================================================= */

async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/topic/list`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();

  if (json.status !== "ok") return [];

  return json.topics || [];
}

/* ========================================================= */

function sortTopics(items: Topic[], mode: SortMode) {
  const copy = [...items];

  switch (mode) {
    case "activity":
      return copy.sort((a, b) => b.nb_analyses - a.nb_analyses);

    case "growth":
      return copy.sort((a, b) => b.delta_30d - a.delta_30d);

    default:
      return copy.sort((a, b) =>
        a.label.localeCompare(b.label)
      );
  }
}

/* ========================================================= */

function groupByAxis(topics: Topic[], mode: SortMode) {
  const map: Record<string, Topic[]> = {};

  topics.forEach((t) => {
    if (!map[t.topic_axis]) {
      map[t.topic_axis] = [];
    }
    map[t.topic_axis].push(t);
  });

  Object.keys(map).forEach((axis) => {
    map[axis] = sortTopics(map[axis], mode);
  });

  return map;
}

/* ========================================================= */

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sortMode, setSortMode] =
    useState<SortMode>("activity");

  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* LOAD */
  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  /* DRAWER */
  useEffect(() => {
    const topicId = searchParams.get("topic_id");

    if (!topicId) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === topicId) return;

    lastOpenedId.current = topicId;
    openLeftDrawer("topic", topicId);
  }, [searchParams, openLeftDrawer]);

  const grouped = groupByAxis(topics, sortMode);

  const totalTopics = topics.length;
  const totalAnalyses = topics.reduce(
    (sum, t) => sum + (t.nb_analyses || 0),
    0
  );

  /* ========================================================= */

  return (
    <div className="space-y-12">

      {/* =====================================================
          HEADER PREMIUM
      ===================================================== */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Topics
          </h1>

          <p className="text-sm text-gray-500 max-w-md">
            Cartographie des dynamiques du marché à travers
            nos analyses et signaux clés.
          </p>

          <div className="flex gap-4 text-xs text-gray-400 pt-1">
            <span>{totalTopics} thèmes</span>
            <span>{totalAnalyses} analyses</span>
          </div>
        </div>

        {/* SORT */}
        <div className="flex gap-2 text-xs">
          {[
            { key: "activity", label: "Activité" },
            { key: "growth", label: "Croissance" },
            { key: "alpha", label: "A → Z" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() =>
                setSortMode(s.key as SortMode)
              }
              className={`
                px-3 py-1.5 rounded-md border transition
                ${
                  sortMode === s.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          SECTIONS
      ===================================================== */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun topic pour le moment.
        </p>
      ) : (
        Object.entries(grouped).map(([axis, items]) => (
          <section key={axis} className="space-y-6">

            {/* AXIS HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {axis}
              </h2>

              <span className="text-xs text-gray-300">
                {items.length} topics
              </span>
            </div>

            {/* GRID */}
            <div className="
              grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
              gap-5
            ">
              {items.map((t) => (
                <div
                  key={t.id_topic}
                  className="transition-transform hover:-translate-y-0.5"
                >
                  <TopicCard
                    id={t.id_topic}
                    label={t.label}
                    nbAnalyses={t.nb_analyses}
                    delta30d={t.delta_30d}
                  />
                </div>
              ))}
            </div>

          </section>
        ))
      )}
    </div>
  );
}
