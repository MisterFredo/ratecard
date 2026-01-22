"use client";

type Props = {
  label: string;
  onClick: () => void;

  // Données pilotées par la page
  nbAnalyses?: number;
  delta30d?: number;

  // Variante visuelle
  variant?: "active" | "default";
};

export default function TopicCard({
  label,
  onClick,
  nbAnalyses = 0,
  delta30d = 0,
  variant = "default",
}: Props) {
  const isActive = variant === "active";

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer
        rounded-xl
        border
        p-5
        transition
        ${
          isActive
            ? "bg-teal-50 border-teal-200 hover:shadow-md"
            : "bg-white hover:shadow-sm hover:border-gray-300"
        }
      `}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold leading-tight">
          {label}
        </h3>

        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-medium">
            En mouvement
          </span>
        )}
      </div>

      {/* =====================================================
          METRICS
      ===================================================== */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <div className="font-medium">
          {nbAnalyses} analyse{nbAnalyses > 1 ? "s" : ""}
        </div>

        {isActive && (
          <div className="text-xs text-teal-700">
            +{delta30d} sur 30j
          </div>
        )}
      </div>
    </div>
  );
}

