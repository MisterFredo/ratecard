import MiniTopicCard from "@/components/home/MiniTopicCard";

export default function TopicColumn({
  title,
  topics,
  isFoundation = false,
}: any) {
  const safeTopics = Array.isArray(topics) ? topics : [];

  return (
    <div className={`${isFoundation ? "max-w-4xl mx-auto" : ""}`}>

      <h2 className="text-xs uppercase tracking-widest text-gray-400 text-center mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {safeTopics.map((t: any) => (
          <MiniTopicCard key={t?.id_topic || Math.random()} topic={t} />
        ))}
      </div>

    </div>
  );
}
