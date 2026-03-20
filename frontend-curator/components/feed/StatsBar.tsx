"use client";

type Props = {
  stats: any;
  onClickStat?: (value: string) => void; // 🔥 prêt pour interaction
};

export default function StatsBar({ stats, onClickStat }: Props) {
  if (!stats) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">

      {/* =========================================================
         TOPICS
      ========================================================= */}
      {stats.topics_stats?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase">
            Top Topics
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.topics_stats.slice(0, 10).map((t: any) => (
              <button
                key={t.id_topic}
                onClick={() => onClickStat?.(t.label)}
                className="
                  px-2 py-1
                  bg-gray-100 text-gray-700
                  text-xs rounded-full
                  hover:bg-gray-200 transition
                "
              >
                {t.label} ({t.total})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
         COMPANIES
      ========================================================= */}
      {stats.top_companies?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase">
            Top Companies
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.top_companies.slice(0, 10).map((c: any) => (
              <button
                key={c.id_company}
                onClick={() => onClickStat?.(c.name)}
                className="
                  px-2 py-1
                  bg-blue-50 text-blue-600
                  text-xs rounded-full
                  hover:bg-blue-100 transition
                "
              >
                {c.name} ({c.total})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
         SOLUTIONS 🔥 NEW
      ========================================================= */}
      {stats.top_solutions?.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-2 uppercase">
            Top Solutions
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.top_solutions.slice(0, 10).map((s: any) => (
              <button
                key={s.id_solution}
                onClick={() => onClickStat?.(s.name)}
                className="
                  px-2 py-1
                  bg-purple-50 text-purple-600
                  text-xs rounded-full
                  hover:bg-purple-100 transition
                "
              >
                {s.name} ({s.total})
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
