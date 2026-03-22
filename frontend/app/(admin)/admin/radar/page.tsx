"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import RadarFilters from "@/components/admin/radar/RadarFilters";
import RadarTable from "@/components/admin/radar/RadarTable";
import RadarActions from "@/components/admin/radar/RadarActions";
import RadarDrawer from "@/components/admin/radar/RadarDrawer";

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);

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
      setSelected([]);

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

  function isSame(a: RadarItem, b: RadarItem) {
    return (
      a.entity_id === b.entity_id &&
      a.period === b.period &&
      a.frequency === b.frequency &&
      a.year === b.year
    );
  }

  function toggle(item: RadarItem) {

    const exists = selected.find((s) => isSame(s, item));

    if (exists) {
      setSelected((prev) => prev.filter((s) => !isSame(s, item)));
    } else {
      setSelected((prev) => [...prev, item]);
    }
  }

  function selectAll() {
    setSelected(items);
  }

  function unselectAll() {
    setSelected([]);
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  async function generateSelected() {

    if (selected.length === 0) return;
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

    if (selected.length === 0) return;

    await Promise.all(
      selected.map((item) =>
        api.put("/radar/validate", item)
      )
    );

    load();
  }

  async function publishSelected() {

    if (selected.length === 0) return;

    await Promise.all(
      selected.map((item) =>
        api.put("/radar/publish", item)
      )
    );

    load();
  }

  /* =========================================================
     PREVIEW
  ========================================================= */

  async function handlePreview(item: RadarItem) {

    try {

      const res = await api.get("/radar/get", {
        params: item,
      });

      setDrawerData(res.insight || null);
      setDrawerOpen(true);

    } catch (e) {

      console.error(e);
      setDrawerData(null);
      setDrawerOpen(true);

    }
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

      <div className="flex gap-4 text-xs">
        <button onClick={selectAll} className="underline">
          Tout sélectionner
        </button>
        <button onClick={unselectAll} className="underline">
          Tout désélectionner
        </button>
        <span className="text-gray-400 ml-auto">
          {selected.length} sélectionnés
        </span>
      </div>

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
        onPreview={handlePreview}
        loading={loading}
      />

      <RadarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />

    </div>
  );
}
