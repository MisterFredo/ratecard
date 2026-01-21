"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import TopicCard from "@/components/topics/TopicCard";

type TopicItem = {
  id_topic: string;
  label: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { openDrawer } = useDrawer();

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/topic/list`, {
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          setTopics(json.topics || []);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header>
        <h1 className="text-2xl font-semibold">
          Topics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore les sujets analysés par Curator
        </p>
      </header>

      {/* =====================================================
          GRID
      ===================================================== */}
      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des topics…
        </p>
      )}

      {!loading && topics.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun topic disponible.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id_topic}
            label={topic.label}
            onClick={() =>
              openDrawer("left", {
                type: "dashboard",
                payload: {
                  scopeType: "topic",
                  scopeId: topic.label,
                },
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
