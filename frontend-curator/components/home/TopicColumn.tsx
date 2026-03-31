import MiniTopicCard from "@/components/home/MiniTopicCard";

export default function TopicColumn({
  title,
  topics,
  isFoundation = false,
}: any) {
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className={`${isFoundation ? "max-w-4xl mx-auto" : ""}`}>

      {/* TITLE */}
      <h2
        className={`text-center mb-6 ${
          isFoundation
            ? "text-lg md:text-xl font-semibold text-black tracking-tight"
            : "text-sm md:text-base font-semibold text-gray-600 uppercase tracking-widest"
        }`}
      >
        {title}
      </h2>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-4">
        {safeTopics.map((t: any) => (
          <MiniTopicCard key={t?.id_topic || Math.random()} topic={t} />
        ))}
      </div>

    </div>
  );
}
