"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";

/* ========================================================= */

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* ========================================================= */

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

type Props = {
  id: string;
  onClose: () => void;
};

/* ========================================================= */

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

/* ========================================================= */

export default function RadarDrawer({ id, onClose }: Props) {
  const [radars, setRadars] = useState<Radar[]>([]);
  const [loading, setLoading] = useState(true);

  const [entity, setEntity] = useState<{
    type: string;
    id: string;
    label: string;
  } | null>(null);

  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const currentRes = await api.get(`/radar/${id}`);
        const current = currentRes?.insight ?? currentRes;

        if (!current) {
          setRadars([]);
          return;
        }

        /* =====================================================
           ENTITY CONTEXT
        ===================================================== */
        setEntity({
          type: current.entity_type,
          id: current.entity_id,
          label: current.entity_label || current.entity_id,
        });

        const listRes = await api.get(
          `/radar/list?entity_type=${current.entity_type}&entity_id=${current.entity_id}`
        );

        const all = listRes?.insights ?? [];
        setRadars(all);

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

  /* ========================================================= */

  function getVisual() {
    if (!entity) return null;

    if (entity.type === "company" || entity.type === "solution") {
      return `${GCS_BASE_URL}/companies/${entity.id}`;
    }

    return null;
  }

  /* ========================================================= */

  return (
    <EntityDrawerLayout onClose={onClose}>

      {/* HEADER */}
      <div className="px-6 pt-6 pb-4 border-b flex items-center gap-3">

        {/* VISUAL */}
        {getVisual() ? (
          <img
            src={getVisual()!}
            alt={entity?.label}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <div className="
            w-8 h-8 flex items-center justify-center
            text-xs bg-gray-100 rounded
          ">
            {entity?.label?.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* LABEL */}
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">
            {entity?.label || "Veille"}
          </div>

          <div className="text-xs text-gray-400">
            Timeline
          </div>
        </div>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

      </div>

      {/* CONTENT */}
      <div className="px-6 py-6 space-y-10">

        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : radars.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune veille disponible.
          </p>
        ) : (
          <div className="relative space-y-8">

            {/* TIMELINE LINE */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

            {radars.map((radar) => {
              const isActive = radar.id_insight === id;

              return (
                <section
                  key={radar.id_insight}
                  ref={(el) => {
                    refs.current[radar.id_insight] = el;
                  }}
                  className="relative pl-6"
                >
                  {/* DOT */}
                  <div
                    className={`
                      absolute left-0 top-2 w-2 h-2 rounded-full
                      ${isActive ? "bg-black" : "bg-gray-300"}
                    `}
                  />

                  {/* CARD */}
                  <div
                    className={
                      isActive
                        ? "p-4 rounded-lg border border-gray-300 bg-gray-50"
                        : "p-3 rounded hover:bg-gray-50"
                      }
                    >
                      {/* DATE */}
                      <div
                        className={`
                          text-xs mb-2
                          ${isActive ? "text-gray-700" : "text-gray-400"}
                        `}
                      >
                        {formatRadarLabel(radar)}
                      </div>

                      {/* POINTS */}
                      <ul className="space-y-2">
                        {radar.key_points?.map((point, i) => (
                          <li
                            key={i}
                            className={`
                              text-sm leading-relaxed
                              ${isActive
                                ? "text-gray-900"
                                : "text-gray-700"}
                            `}
                          >
                            <span className="text-gray-400 mr-2">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                </section>
              );
            })}
          </div>
        )}

      </div>

    </EntityDrawerLayout>
  );
}
