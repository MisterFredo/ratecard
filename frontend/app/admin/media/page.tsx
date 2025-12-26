"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MediaGrid from "./grid";
import MediaTable from "./table";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";

export type MediaItem = {
  id: string;
  url: string;
  folder: string;
  category: string;
  type: string;
  size: number;
  createdAt: number;
};

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "logos", label: "Logos" },
  { key: "logosCropped", label: "Formatés" },
  { key: "articles", label: "Articles" },
  { key: "ia", label: "IA générés" },
  { key: "generics", label: "Génériques" },
];

export default function MediaManagerPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filtered, setFiltered] = useState<MediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);

  async function loadMedia() {
    setLoading(true);
    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media);
      applyFilter(json.media, activeFilter);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMedia();
  }, []);

  function applyFilter(list: MediaItem[], key: string) {
    if (key === "all") setFiltered(list);
    else setFiltered(list.filter((m) => m.category === key));
  }

  function onFilterChange(key: string) {
    setActiveFilter(key);
    applyFilter(media, key);
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-3xl font-bold text-ratecard-blue tracking-tight">
            Médiathèque
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez vos logos, visuels d’articles et visuels IA.
          </p>
        </div>

        <Link
          href="/admin/media/create"
          className="flex items-center gap-2 bg-ratecard-green text-white px-4 py-2 rounded-xl shadow-md hover:bg-green-600 transition"
        >
          <Plus size={18} />
          Ajouter un média
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 py-2">
        {FILTERS.map((f) => {
          const active = f.key === activeFilter;
          return (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition
                ${active
                  ? "bg-ratecard-blue text-white shadow"
                  : "bg-white text-gray-700 border hover:bg-gray-100"}
              `}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* VIEW SWITCHER */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm w-fit">
        <button
          onClick={() => setView("grid")}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${
            view === "grid"
              ? "bg-ratecard-blue text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid size={16} /> Grid
        </button>

        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition ${
            view === "table"
              ? "bg-ratecard-blue text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <TableIcon size={16} /> Table
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="mt-4">
        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 italic text-sm">
            Aucun média à afficher pour ce filtre.
          </p>
        ) : view === "grid" ? (
          <MediaGrid items={filtered} refresh={loadMedia} />
        ) : (
          <MediaTable items={filtered} refresh={loadMedia} />
        )}
      </div>
    </div>
  );
}
