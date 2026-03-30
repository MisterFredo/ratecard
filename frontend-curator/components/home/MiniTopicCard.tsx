export default function MiniTopicCard({ topic }: any) {
  if (!topic) return null;

  const isTrending =
    typeof topic.delta30d === "number" && topic.delta30d > 0;

  const intensity =
    typeof topic.nb_analyses === "number"
      ? Math.min(topic.nb_analyses * 2, 100)
      : 0;

  function getColor(topic: any) {
    switch (topic?.topic_axis) {
      case "RETAIL":
        return "bg-green-400/80";
      case "MEDIA":
        return "bg-purple-400/80";
      case "FOUNDATIONS":
        return "bg-blue-400/80";
      default:
        return "bg-gray-900";
    }
  }

  return (
    <div
      className="
        group
        rounded-xl border border-gray-200 bg-white
        p-2.5
        transition-all duration-200
        hover:border-gray-300
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">
        {typeof topic.nb_analyses === "number" && (
          <span className="text-[10px] text-gray-400">
            {topic.nb_analyses}
          </span>
        )}

        {isTrending && (
          <span className="text-[10px] text-orange-500 font-medium">
            +{topic.delta30d}
          </span>
        )}
      </div>

      {/* LABEL */}
      <div className="text-sm font-medium text-gray-900 leading-snug group-hover:text-black transition">
        {topic.label || "—"}
      </div>

      {/* BAR */}
      {typeof topic.nb_analyses === "number" && (
        <div className="mt-2 h-[2px] w-full bg-gray-100 rounded">
          <div
            className={`h-full ${getColor(topic)} transition-all duration-300`}
            style={{ width: `${intensity}%` }}
          />
        </div>
      )}
    </div>
  );
}
