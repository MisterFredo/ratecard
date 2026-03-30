"use client";

import MiniTopicCard from "@/components/home/MiniTopicCard";

export default function TopicColumn({
  title,
  topics,
  isFoundation = false,
}: any) {
  return (
    <div className={`${isFoundation ? "max-w-4xl mx-auto" : ""}`}>

      {/* TITLE */}
      <h2 className="text-xs uppercase tracking-widest text-gray-400 text-center mb-6">
        {title}
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4">
        {topics.map((t: any) => (
          <MiniTopicCard key={t.id_topic} topic={t} />
        ))}
      </div>

    </div>
  );
}
