"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";

/* =========================================================
   TYPES
========================================================= */

type Radar = {
  id_insight: string;

  entity_type: string;
  entity_id: string;

  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";

  key_points: string[];

  created_at: string;
};

/* =========================================================
   PROPS
========================================================= */

type Props = {
  id: string;
  onClose: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

function formatRadarLabel(r: Radar) {
  if (r.frequency === "MONTHLY") {
    const date = new Date(r.year, r.period - 1);
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (r.frequency === "QUARTERLY") {
    return `T${r.period} ${r.year}`;
  }

  if (r.frequency === "WEEKLY") {
    return `Semaine ${r.period} ${r.year}`;
  }

  return "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RadarDrawer({ id, onClose }: Props) {
  const [radars, setRadars] = useState<Radar[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD (LIST)
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1️⃣ récupérer le radar actuel
        const current = await api.get(`/radar/${id}`);

        // 2️⃣ récupérer toute la timeline
        const res = await api.get(
          `/radar/list?entity_type=${current.entity_type}&entity_id=${current.entity_id}`
        );

        setRadars(res?.insights ?? []);

      } catch (e) {
        console.error("❌ Radar list error", e);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <EntityDrawerLayout onClose={onClose}>

      {/* HEADER */}
      <DrawerHeader
        title="Synthèses"
        subtitle=""
        variant="topic"
        onClose={onClose}
      />

      {/* CONTENT */}
      <div className="px-6 py-8 space-y-10">

        {loading ? (
          <p className="text-sm text-gray-400">
            Chargement...
          </p>
        ) : radars.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune synthèse disponible.
          </p>
        ) : (
          radars.map((radar) => (
            <section
              key={radar.id_insight}
              className="space-y-4"
            >
              {/* HEADER PERIOD */}
              <h2 className="text-sm font-semibold text-gray-900">
                {formatRadarLabel(radar)}
              </h2>

              {/* KEY POINTS */}
              <ul className="space-y-2">
                {radar.key_points?.map((point, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-800 leading-relaxed"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

      </div>

    </EntityDrawerLayout>
  );
}
