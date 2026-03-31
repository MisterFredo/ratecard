"use client";

import TopicColumn from "@/components/home/TopicColumn";

export default function StepTopics({ topics }: any) {
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className="max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-5xl font-semibold text-center mb-12 tracking-tight">
        Deux écosystèmes,
        <span className="block text-gray-400 font-normal">
          un socle commun
        </span>
      </h1>

      {/* TOP */}
      <div className="grid grid-cols-2 gap-16 mb-10">

        <TopicColumn
          title="Retail"
          topics={safeTopics.filter((t: any) => t?.topic_axis === "RETAIL")}
        />

        <TopicColumn
          title="Media"
          topics={safeTopics.filter((t: any) => t?.topic_axis === "MEDIA")}
        />

      </div>

      {/* FOUNDATION */}
      <div className="border-t pt-8">

        <TopicColumn
          title="Foundations"
          topics={safeTopics.filter((t: any) => t?.topic_axis === "FOUNDATIONS")}
          isFoundation
        />

      </div>

    </div>
  );
}
