"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import NumbersRawTable from "./NumbersRawTable";

/* =========================================================
   TYPE STRUCTURÉ
========================================================= */

type NumberItem = {
  id_content: string;
  label: string;
  value: string;
  unit: string;
  context: string;
};


/* ========================================================= */

export default function NumbersRawPanel() {

  const [items, setItems] = useState<NumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD
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

  function getId(item: NumberItem) {
    return `${item.id_content}__${item.label}__${item.value}`;
  }

  function toggle(item: NumberItem) {

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

   function updateLocal(updated: NumberItem) {
     setItems((prev) =>
       prev.map((i) =>
         getId(i) === getId(updated) ? updated : i
       )
     );
   }

  /* =========================================================
     ACTIONS — BULK VALIDATE
  ========================================================= */

  async function validateBulk() {

    if (selected.length === 0) return;

    try {

      const toValidate = items.filter((i) =>
        selected.includes(getId(i))
      );

      await Promise.all(
        toValidate.map((item) =>
          api.post("/numbers/structured/create", {
            id_content: item.id_content,
            label: item.label,
            value: item.value,
            unit: item.unit,
            context: item.context,
          })
        )
      );

      // 🔥 suppression immédiate
      setItems((prev) =>
        prev.filter((i) => !selected.includes(getId(i)))
      );

      setSelected([]);

      console.log("✔ Bulk validated");

    } catch (e) {
      console.error("Erreur validate bulk", e);
    }
  }

  /* =========================================================
     ACTIONS — BULK IGNORE
  ========================================================= */

  async function rejectBulk() {

    const newItems = items.filter(
      (i) => !selected.includes(getId(i))
    );

    setItems(newItems);
    setSelected([]);
  }

  /* =========================================================
     SAVE (SINGLE)
  ========================================================= */

  async function save(item: NumberItem) {

     try {

       await api.post("/numbers/structured/create", {
         id_content: item.id_content,
         label: item.label,
         value: item.value,
         unit: item.unit,
         context: item.context,
         topic_labels: item.topics
           ?.filter(t => t.checked)
           .map(t => t.label) || [], // 🔥 FIX
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
        onChange={updateLocal} // 🔥 AJOUT ICI
      />

    </div>
  );
}
