"use client";

/* =========================================================
   TYPES
========================================================= */
type FeedFilters = {
  query: string;
  mode: "explore" | "watch";
  contentType?: "all" | "analysis" | "news"; // ✅ ajouté
};

type Props = {
  filters: FeedFilters;
  onChange: (filters: FeedFilters) => void;
};

export default function FeedControlBar({
  filters,
  onChange,
}: Props) {

  /* =====================================================
     HANDLERS
  ===================================================== */

  function handleQueryChange(value: string) {
    onChange({
      ...filters,
      query: value,
    });
  }

  function handleModeChange(mode: "explore" | "watch") {
    onChange({
      ...filters,
      mode,
    });
  }

  function handleContentTypeChange(
    type: "all" | "analysis" | "news"
  ) {
    onChange({
      ...filters,
      contentType: type,
    });
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">

      {/* ================================
          TOP ROW
      ================================= */}
      <div className="flex items-center gap-3">

        {/* SEARCH */}
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Rechercher un sujet, une entreprise..."
          className="
            flex-1
            border rounded-md px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-teal-500
          "
        />

        {/* MODE */}
        <div className="flex border rounded-md overflow-hidden text-sm">

          <button
            onClick={() => handleModeChange("explore")}
            className={`
              px-3 py-1.5 transition
              ${
                filters.mode === "explore"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Explorer
          </button>

          <button
            onClick={() => handleModeChange("watch")}
            className={`
              px-3 py-1.5 transition
              ${
                filters.mode === "watch"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Suivi
          </button>

        </div>
      </div>

      {/* ================================
          CONTENT TYPE (🔥 NOUVEAU)
      ================================= */}
      <div className="flex gap-2">

        {[
          { key: "all", label: "Tout" },
          { key: "analysis", label: "Analyses" },
          { key: "news", label: "News" },
        ].map((item) => {
          const active = filters.contentType === item.key;

          return (
            <button
              key={item.key}
              onClick={() =>
                handleContentTypeChange(
                  item.key as "all" | "analysis" | "news"
                )
              }
              className={`
                px-3 py-1 text-sm border rounded transition
                ${
                  active
                    ? "bg-black text-white"
                    : "hover:bg-gray-50 text-gray-700"
                }
              `}
            >
              {item.label}
            </button>
          );
        })}

      </div>

      {/* ================================
          PLACEHOLDER
      ================================= */}
      <div className="text-xs text-gray-500">
        Filtres avancés (topics, sociétés, solutions) à venir
      </div>

    </div>
  );
}
