"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import NumbersRawTable from "./NumbersRawTable";

/* ========================================================= */

type RawNumberItem = {
  id_content: string;
  raw: string;
};

type ParsedNumberItem = {
  id_content: string;
  label: string;
  value: string;
  unit: string;
  context: string;
};

/* ========================================================= */

export default function NumbersRawPanel() {

  const [items, setItems] = useState<ParsedNumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     PARSER (🔥 FUTUR ONLY)
  ========================================================= */

  function parseRow(row: RawNumberItem): ParsedNumberItem[] {

    if (!row.raw) return [];

    const parts = row.raw
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean);

    const results: ParsedNumberItem[] = [];

    for (let i = 0; i < parts.length; i += 4) {

      if (parts.length < i + 4) continue;

      results.push({
        id_content: row.id_content,
        label: parts[i],
        value: parts[i + 1],
        unit: parts[i + 2],
        context: parts[i + 3],
      });
    }

    return results;
  }

  /* =========================================================
     LOAD
  ========================================================= */

  async function load() {

    setLoading(true);

    try {

      const res = await api.get("/numbers/raw?limit=500");

      const parsed = (res.items || []).flatMap((row: any) =>
        parseRow({
          id_content: row.id_content,
          raw: row.chiffre,
        })
      );

      setItems(parsed);
      setSelected([]);

    } catch (e) {
      console.error("Erreur load RAW numbers", e);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* =========================================================
     SELECT
  ========================================================= */

  function getId(item: ParsedNumberItem) {
    return `${item.id_content}_${item.label}_${item.value}`;
  }

  function toggle(item: ParsedNumberItem) {

    const id = getId(item);

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(items.map(getId));
  }

  function unselectAll() {
    setSelected([]);
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  async function validateBulk() {

    if (selected.length === 0) return;

    try {

      await Promise.all(
        items
          .filter((i) => selected.includes(getId(i)))
          .map((item) =>
            api.post("/numbers/structured/create", {
              id_content: item.id_content,
              label: item.label,
              value: item.value,
              unit: item.unit,
              context: item.context,
            })
          )
      );

      load();

    } catch (e) {
      console.error("Erreur validate bulk", e);
    }
  }

  async function rejectBulk() {

    const newItems = items.filter(
      (i) => !selected.includes(getId(i))
    );

    setItems(newItems);
    setSelected([]);
  }

  async function save(item: ParsedNumberItem) {

    try {

      await api.post("/numbers/structured/create", {
        id_content: item.id_content,
        label: item.label,
        value: item.value,
        unit: item.unit,
        context: item.context,
      });

      load();

    } catch (e) {
      console.error("Erreur save", e);
    }
  }

  /* ========================================================= */

  if (loading) return <p>Chargement…</p>;

  return (

    <div className="space-y-6">

      {/* ACTIONS */}
      <div className="flex gap-4 text-sm">

        <button onClick={selectAll} className="underline">
          Tout sélectionner
        </button>

        <button onClick={unselectAll} className="underline">
          Tout désélectionner
        </button>

        <span className="ml-auto text-gray-400">
          {selected.length} sélectionnés
        </span>

      </div>

      <div className="flex gap-2">

        <button
          onClick={validateBulk}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          VALIDATE
        </button>

        <button
          onClick={rejectBulk}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          IGNORE
        </button>

      </div>

      {/* TABLE */}
      <NumbersRawTable
        items={items}
        selected={selected}
        getId={getId}
        onToggle={toggle}
        onSave={save}
      />

    </div>

  );
}
