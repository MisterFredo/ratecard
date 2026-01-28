"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import TopicCard from "@/components/topics/TopicCard";

type TopicItem = {
  id_topic: string;
  label: string;
  topic_axis: "BUSINESS" | "FIELD";
  nb_analyses: number;
  delta_30d?: number;
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

          const mappedTopics = (json.topics || []).map((t: any) => ({
            id_topic: t.ID_TOPIC,
            label: t.LABEL,
            topic_axis: t.TOPIC_AXIS,
            nb_analyses: t.NB_ANALYSES ?? 0,
            delta_30d: t.DELTA_30D ?? 0,
          }));

          setTopics(mappedTopics);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, []);

  function renderSection(
    axis: "BUSINESS" | "FIELD",
    title: string,
    subtitle: string
  ) {
    const axisTopics = topics.filter(
      (t) => t.topic_axis === axis
    );

    const activeTopics = axisTopics
      .filter((t) => t.nb_analyses > 0)
      .sort((a, b) => b.nb_analyses - a.nb_analyses);

    const otherTopics = axisTopics
      .filter((t) => t.nb_analyses === 0)
      .sort((a, b) => a.label.localeCompare(b.label));

    if (axisTopics.length === 0) return null;

    return (
      <section className="space-y-8">
        <header>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </header>

        {activeTopics.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Topics en mouvement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeTopics.map((topic) => (
                <TopicCard
                  key={topic.id_topic}
                  label={topic.label}
                  nbAnalyses={topic.nb_analyses}
                  delta30d={topic.delta_30d}
                  variant="active"
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
        )}

        {otherTopics.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Autres topics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherTopics.map((topic) => (
                <TopicCard
                  key={topic.id_topic}
                  label={topic.label}
                  nbAnalyses={topic.nb_analyses}
                  variant="default"
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
        )}
      </section>
    );
  }

  return (
    <div className="space-y-14">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-semibold">Topics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Grilles de lecture et terrains analysés par Curator
        </p>
      </header>

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

      {!loading && (
        <>
          {renderSection(
            "BUSINESS",
            "Business & enjeux",
            "Comprendre les logiques économiques, stratégiques et opérationnelles"
          )}

          {renderSection(
            "FIELD",
            "Terrains & environnements",
            "Canaux, contextes et espaces d’activation"
          )}
        </>
      )}
    </div>
  );
}
