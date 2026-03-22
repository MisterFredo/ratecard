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

function getPeriodLabel(r: Radar) {
  if (r.frequency === "MONTHLY") {
    return `Mois ${r.period} · ${r.year}`;
  }
  if (r.frequency === "QUARTERLY") {
    return `Trimestre ${r.period} · ${r.year}`;
  }
  if (r.frequency === "WEEKLY") {
    return `Semaine ${r.period} · ${r.year}`;
  }
  return "";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RadarDrawer({ id, onClose }: Props) {
  const [radar, setRadar] = useState<Radar | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await api.get(`/radar/${id}`);

        setRadar(res);

      } catch (e) {
        console.error("❌ Radar load error", e);
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
        title="Synthèse"
        subtitle={radar ? getPeriodLabel(radar) : ""}
        variant="topic"
        onClose={onClose}
      />

      {/* CONTENT */}
      <div className="px-6 py-8">

        {loading ? (
          <p className="text-sm text-gray-400">
            Chargement...
          </p>
        ) : !radar ? (
          <p className="text-sm text-gray-400">
            Aucune synthèse disponible.
          </p>
        ) : (
          <div className="space-y-6">

            {/* KEY POINTS */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500">
                Points clés
              </h2>

              <ul className="space-y-3">
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

          </div>
        )}

      </div>

    </EntityDrawerLayout>
  );
}
