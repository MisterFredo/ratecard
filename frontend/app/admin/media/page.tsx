"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MediaGrid from "./grid";
import MediaTable from "./table";

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
    if (key === "all") {
      setFiltered(list);
    } else {
      setFiltered(list.filter((m) => m.category === key));
    }
  }

  function onFilterChange(key: string) {
    setActiveFilter(key);
    applyFilter(media, key);
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Media Manager
        </h1>

        <Link
          href="/admin/media/create"
          className="bg-ratecard-green px-4 py-2 rounded text-white"
        >
          + Ajouter un visuel
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-2 rounded text-sm border ${
              activeFilter === f.key
                ? "bg-ratecard-blue text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* VIEW SWITCH */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("grid")}
          className={`px-3 py-1 rounded ${
            view === "grid"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setView("table")}
          className={`px-3 py-1 rounded ${
            view === "table"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Table
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : view === "grid" ? (
        <MediaGrid items={filtered} refresh={loadMedia} />
      ) : (
        <MediaTable items={filtered} refresh={loadMedia} />
      )}

    </div>
  );
}
