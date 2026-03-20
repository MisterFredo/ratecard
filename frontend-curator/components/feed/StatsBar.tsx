"use client";

type Props = {
  stats: any;
};

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">

      {/* GLOBAL */}
      <div className="flex gap-6 text-sm">
        <div>
          <div className="text-gray-400 text-xs">Total</div>
          <div className="font-semibold text-gray-900">
            {stats.total_count}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs">Last 7 days</div>
          <div className="font-semibold text-gray-900">
            {stats.last_7_days}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-xs">Last 30 days</div>
          <div className="font-semibold text-gray-900">
            {stats.last_30_days}
          </div>
        </div>
      </div>

      {/* TOPICS */}
      {stats.topics_stats?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase">
            Top Topics
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.topics_stats.slice(0, 10).map((t: any) => (
              <div
                key={t.id_topic}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {t.label} ({t.total})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPANIES */}
      {stats.top_companies?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase">
            Top Companies
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.top_companies.slice(0, 10).map((c: any) => (
              <div
                key={c.id_company}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                {c.name} ({c.total})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
