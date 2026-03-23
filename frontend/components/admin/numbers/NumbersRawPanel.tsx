"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import NumbersRawTable from "./NumbersRawTable";

/* =========================================================
   RAW TYPE (FROM CONTENT)
========================================================= */

type RawNumberItem = {
  id_content: string;
  chiffre: string;
};

/* ========================================================= */

export default function NumbersRawPanel() {

  const [items, setItems] = useState<RawNumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD RAW (🔥 IMPORTANT)
  ========================================================= */

  async function load() {

    setLoading(true);

    try {

      const res = await api.get("/numbers/raw?limit=500");

      setItems(res.items || []);
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

  function getId(item: RawNumberItem) {
    return `${item.id_content}__${item.chiffre}`;
  }

  function toggle(item: RawNumberItem) {

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
              raw_value: item.chiffre,
            })
          )
      );

      load();

    } catch (e) {
      console.error("Erreur validate bulk", e);
    }
  }

  async function rejectBulk() {

    // 👉 pour le moment :
    // on ne fait rien côté BQ (pas de trace)
    // on retire juste du front

    const newItems = items.filter(
      (i) => !selected.includes(getId(i))
    );

    setItems(newItems);
    setSelected([]);
  }

  /* =========================================================
     SINGLE SAVE (EDIT + VALIDATE)
  ========================================================= */

  async function save(item: RawNumberItem, parsed: any) {

    try {

      await api.post("/numbers/structured/create", {
        id_content: item.id_content,
        label: parsed.label,
        value: parsed.value,
        unit: parsed.unit,
        context: parsed.context,
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
