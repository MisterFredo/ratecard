"use client";

import { useEffect, useRef, useState } from "react";
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

  const refs = useRef<Record<string, HTMLElement | null>>({});

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1. radar courant
        const currentRes = await api.get(`/radar/${id}`);
        const current = currentRes?.insight ?? currentRes;

        if (!current) {
          setRadars([]);
          return;
        }

        // 2. timeline complète
        const listRes = await api.get(
          `/radar/list?entity_type=${current.entity_type}&entity_id=${current.entity_id}`
        );

        const all = listRes?.insights ?? [];
        setRadars(all);

        // 3. scroll vers le radar actif (offset léger)
        setTimeout(() => {
          const el = refs.current[id];
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 120);

      } catch (e) {
        console.error("❌ Radar list error", e);
        setRadars([]);
      } finally {
        setLoading(false);
      }
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
        title="Veille"
        subtitle=""
        variant="topic"
        onClose={onClose}
      />

      {/* CONTENT */}
      <div className="px-6 py-8 space-y-12">

        {loading ? (
          <p className="text-sm text-gray-400">
            Chargement...
          </p>
        ) : radars.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune veille disponible.
          </p>
        ) : (
          radars.map((radar) => {
            const isActive = radar.id_insight === id;

            return (
              <section
                key={radar.id_insight}
                ref={(el) => {
                  refs.current[radar.id_insight] = el;
                }}
                className={`
                  space-y-4
                  ${isActive ? "bg-gray-50 p-4 rounded" : ""}
                `}
              >
                {/* HEADER PERIOD */}
                <h2
                  className={`
                    text-sm font-semibold
                    ${isActive ? "text-black" : "text-gray-900"}
                  `}
                >
                  {formatRadarLabel(radar)}
                </h2>

                {/* KEY POINTS */}
                <ul className="space-y-2">
                  {radar.key_points?.map((point, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-800 leading-relaxed"
                    >
                      • {point}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}

      </div>

    </EntityDrawerLayout>
  );
}
