export default function MiniTopicCard({ topic }: any) {
  if (!topic) return null;

  const isTrending =
    typeof topic.delta30d === "number" && topic.delta30d > 0;

  const intensity =
    typeof topic.nb_analyses === "number"
      ? Math.min(topic.nb_analyses * 2, 100)
      : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">

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

      <div className="text-sm font-medium text-gray-900 leading-snug">
        {topic.label || "—"}
      </div>

      {typeof topic.nb_analyses === "number" && (
        <div className="mt-2 h-[2px] w-full bg-gray-100 rounded">
          <div
            className="h-full bg-gray-900"
            style={{ width: `${intensity}%` }}
          />
        </div>
      )}
    </div>
  );
}
