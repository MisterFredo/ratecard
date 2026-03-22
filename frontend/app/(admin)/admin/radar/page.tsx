"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import RadarFilters from "@/components/radar/RadarFilters";
import RadarTable from "@/components/radar/RadarTable";
import RadarActions from "@/components/radar/RadarActions";

/* ========================================================= */

export type RadarItem = {
  entity_type: string;
  entity_id: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  nb_contents: number;
  radar_status: "MISSING" | "EXISTS";
};

/* ========================================================= */

export default function RadarPage() {

  const [items, setItems] = useState<RadarItem[]>([]);
  const [selected, setSelected] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    entity_type: "topic",
    frequency: "MONTHLY",
    year: new Date().getFullYear(),
  });

  /* =========================================================
     LOAD VIEW
  ========================================================= */

  async function load() {

    setLoading(true);

    try {

      const res = await api.get("/radar/status", {
        params: filters,
      });

      setItems(res.items || []);

    } catch (e) {

      console.error(e);

    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filters]);

  /* =========================================================
     SELECT
  ========================================================= */

  function toggle(item: RadarItem) {

    const exists = selected.find(
      (s) =>
        s.entity_id === item.entity_id &&
        s.period === item.period &&
        s.frequency === item.frequency
    );

    if (exists) {
      setSelected((prev) =>
        prev.filter(
          (s) =>
            !(
              s.entity_id === item.entity_id &&
              s.period === item.period &&
              s.frequency === item.frequency
            )
        )
      );
    } else {
      setSelected((prev) => [...prev, item]);
    }
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  async function generateSelected() {

    if (!confirm("Générer les radars sélectionnés ?")) return;

    try {

      await Promise.all(
        selected.map((item) =>
          api.post("/radar/generate", item)
        )
      );

      load();

    } catch (e) {
      console.error(e);
    }
  }

  async function validateSelected() {

    await Promise.all(
      selected.map((item) =>
        api.put("/radar/validate", item)
      )
    );

    load();
  }

  async function publishSelected() {

    await Promise.all(
      selected.map((item) =>
        api.put("/radar/publish", item)
      )
    );

    load();
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold text-ratecard-blue">
        Radar Control Panel
      </h1>

      <RadarFilters filters={filters} setFilters={setFilters} />

      <RadarActions
        selectedCount={selected.length}
        onGenerate={generateSelected}
        onValidate={validateSelected}
        onPublish={publishSelected}
      />

      <RadarTable
        items={items}
        selected={selected}
        onToggle={toggle}
        loading={loading}
      />

    </div>
  );
}
