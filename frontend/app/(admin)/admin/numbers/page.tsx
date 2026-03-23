"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import NumbersFilters from "@/components/admin/numbers/NumbersFilters";
import NumbersTable from "@/components/admin/numbers/NumbersTable";
import NumbersActions from "@/components/admin/numbers/NumbersActions";
import NumbersDrawer from "@/components/admin/numbers/NumbersDrawer";
import NumbersRawPanel from "@/components/admin/numbers/NumbersRawPanel";

import { NumbersItem } from "@/types/numbers";

/* ========================================================= */

export default function NumbersPage() {

  const [tab, setTab] = useState<"insights" | "raw">("insights");

  const [items, setItems] = useState<NumbersItem[]>([]);
  const [selected, setSelected] = useState<NumbersItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    entity_type: "topic",
    frequency: "MONTHLY",
    year: new Date().getFullYear(),
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);

  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {

    setLoading(true);

    try {

      const query = new URLSearchParams({
        entity_type: filters.entity_type,
        frequency: filters.frequency,
        year: String(filters.year),
      }).toString();

      const res = await api.get(`/numbers/status?${query}`);

      setItems(res.items || []);
      setSelected([]);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (tab === "insights") {
      load();
    }
  }, [filters, tab]);

  /* =========================================================
     SELECT
  ========================================================= */

  function isSame(a: NumbersItem, b: NumbersItem) {
    return (
      a.entity_id === b.entity_id &&
      a.period === b.period &&
      a.frequency === b.frequency &&
      a.year === b.year
    );
  }

  function toggle(item: NumbersItem) {

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
    if (!confirm("Générer les chiffres consolidés ?")) return;

    await Promise.all(
      selected.map((item) =>
        api.post("/numbers/generate", item)
      )
    );

    load();
  }

  async function validateSelected() {

    await Promise.all(
      selected.map((item) =>
        api.put("/numbers/update", {
          ...item,
          status: "VALIDATED",
        })
      )
    );

    load();
  }

  async function publishSelected() {

    await Promise.all(
      selected.map((item) =>
        api.put("/numbers/update", {
          ...item,
          status: "PUBLISHED",
        })
      )
    );

    load();
  }

  /* =========================================================
     PREVIEW
  ========================================================= */

  async function handlePreview(item: NumbersItem) {

    try {

      const query = new URLSearchParams({
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        year: String(item.year),
        period: String(item.period),
        frequency: item.frequency,
      }).toString();

      const res = await api.get(`/numbers/get?${query}`);

      setDrawerData(res.insight || null);
      setDrawerOpen(true);

    } catch (e) {
      console.error(e);
      setDrawerData(null);
      setDrawerOpen(true);
    }
  }

  /* ========================================================= */

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-semibold text-ratecard-blue">
        Numbers Control Panel
      </h1>

      {/* 🔥 TABS */}
      <div className="flex gap-4">

        <button
          onClick={() => setTab("insights")}
          className={`px-3 py-1 rounded ${
            tab === "insights"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Insights
        </button>

        <button
          onClick={() => setTab("raw")}
          className={`px-3 py-1 rounded ${
            tab === "raw"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Raw Numbers
        </button>

      </div>

      {/* =========================================================
         INSIGHTS (inchangé)
      ========================================================= */}

      {tab === "insights" && (
        <>

          <NumbersFilters filters={filters} setFilters={setFilters} />

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

          <NumbersActions
            selectedCount={selected.length}
            onGenerate={generateSelected}
            onValidate={validateSelected}
            onPublish={publishSelected}
          />

          <NumbersTable
            items={items}
            selected={selected}
            onToggle={toggle}
            onPreview={handlePreview}
            loading={loading}
          />

          <NumbersDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            data={drawerData}
          />

        </>
      )}

      {/* =========================================================
         RAW NUMBERS
      ========================================================= */}

      {tab === "raw" && (
        <NumbersRawPanel />
      )}

    </div>

  );
}
