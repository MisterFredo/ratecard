"use client";

import Column from "./Column";

export default function StepTopics({ topics }: any) {
  return (
    <div className="max-w-6xl mx-auto">

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}
      <h1 className="text-5xl font-semibold text-center mb-20 tracking-tight">
        Deux écosystèmes,
        <span className="block text-gray-400 font-normal">
          un socle commun
        </span>
      </h1>

      {/* ========================= */}
      {/* TOP LAYER */}
      {/* ========================= */}
      <div className="grid grid-cols-2 gap-16 mb-16">

        <Column
          title="Retail"
          variant="retail"
          items={topics.filter((t: any) => t.topic_axis === "RETAIL")}
        />

        <Column
          title="Media"
          variant="media"
          items={topics.filter((t: any) => t.topic_axis === "MEDIA")}
        />

      </div>

      {/* ========================= */}
      {/* FOUNDATION */}
      {/* ========================= */}
      <div className="border-t pt-12">

        <Column
          title="Foundations"
          variant="foundation"
          items={topics.filter((t: any) => t.topic_axis === "FOUNDATIONS")}
          isFoundation
        />

      </div>

    </div>
  );
}
