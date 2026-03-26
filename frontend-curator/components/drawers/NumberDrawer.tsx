"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";

/* =========================================================
   TYPES
========================================================= */

type NumberItem = {
  id_number: string;
  label?: string;
  value?: number;
  unit?: string;
  scale?: string;
  zone?: string;
  period?: string;
};

type NumberType = {
  type: string;
  numbers: NumberItem[];
};

type NumberCategory = {
  category: string;
  types: NumberType[];
};

/* =========================================================
   PROPS
========================================================= */

type Props = {
  id: string;
  entityType?: "company" | "topic" | "solution"; // ✅ safe
  onClose: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(n: NumberItem) {
  if (n.value === undefined || n.value === null) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[n.scale || ""] || "";
  const unit = n.unit || "";

  const value = n.value;

  const main = `${value}${scale}${unit}`;
  const context = [n.zone, n.period].filter(Boolean).join(" — ");

  return context ? `${main} — ${context}` : main;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NumberDrawer({
  id,
  entityType,
  onClose,
}: Props) {
  const [data, setData] = useState<NumberCategory[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        // 🔴 sécurité clé
        if (!entityType) {
          console.warn("❌ NumberDrawer: entityType missing");
          setData([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        const url = `/numbers/entity?entity_type=${entityType}&entity_id=${id}`;

        // 🔍 DEBUG (tu peux enlever après)
        console.log("➡️ Numbers API:", url);

        const res = await api.get(url);

        setData(res.items ?? []);
      } catch (e) {
        console.error("❌ Numbers drawer load error", e);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, entityType]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <EntityDrawerLayout onClose={onClose}>

      {/* HEADER */}
      <DrawerHeader
        title="Chiffres"
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
        ) : !entityType ? (
          <p className="text-sm text-red-400">
            Erreur: entityType manquant
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucun chiffre disponible.
          </p>
        ) : (
          data.map((category) => (
            <section key={category.category} className="space-y-6">

              {/* CATEGORY */}
              <h2 className="text-sm font-semibold uppercase text-gray-500">
                {category.category}
              </h2>

              {/* TYPES */}
              <div className="space-y-6">
                {category.types.map((type) => (
                  <div key={type.type} className="space-y-2">

                    {/* TYPE */}
                    <h3 className="text-sm font-medium text-gray-900">
                      {type.type}
                    </h3>

                    {/* NUMBERS */}
                    <div className="space-y-3">
                      {type.numbers.map((n) => (
                        <div key={n.id_number}>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(n)}
                          </div>

                          {n.label && (
                            <div className="text-xs text-gray-500">
                              {n.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            </section>
          ))
        )}

      </div>

    </EntityDrawerLayout>
  );
}
