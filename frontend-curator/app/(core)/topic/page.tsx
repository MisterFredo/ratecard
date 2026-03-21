"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import TopicCard from "@/components/topics/TopicCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type Topic = {
  id_topic: string;
  label: string;
  topic_axis: string;
};

/* =========================================================
   FETCH
========================================================= */

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

/* =========================================================
   GROUP BY AXIS
========================================================= */

function groupByAxis(topics: Topic[]) {
  const map: Record<string, Topic[]> = {};

  topics.forEach((t) => {
    if (!map[t.topic_axis]) {
      map[t.topic_axis] = [];
    }
    map[t.topic_axis].push(t);
  });

  return map;
}

/* =========================================================
   PAGE
========================================================= */

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Load topics
  --------------------------------------------------------- */
  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  /* ---------------------------------------------------------
     Drawer via URL
     /topics?topic_id=XXXX
  --------------------------------------------------------- */
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

  const grouped = groupByAxis(topics);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Topics
        </h1>
        <p className="text-sm text-gray-500">
          Explore les grandes thématiques du marché
        </p>
      </div>

      {/* Sections */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun topic pour le moment.
        </p>
      ) : (
        Object.entries(grouped).map(([axis, items]) => (
          <section key={axis} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {axis}
            </h2>

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                lg:grid-cols-5
                xl:grid-cols-6
                gap-4
              "
            >
              {items.map((t) => (
                <TopicCard
                  key={t.id_topic}
                  id={t.id_topic}
                  label={t.label}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
