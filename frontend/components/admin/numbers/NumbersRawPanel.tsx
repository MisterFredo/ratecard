"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import NumbersRawTable from "./NumbersRawTable";

type NumberItem = {
  ID_NUMBER: string;
  LABEL: string;
  VALUE: number | null;
  UNIT: string;
  CONTEXT: string;
};

export default function NumbersRawPanel() {

  const [items, setItems] = useState<NumberItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ========================================================= */

  async function load() {

    setLoading(true);

    try {
      const res = await api.get("/numbers/pending");
      setItems(res.items || []);
      setSelected([]);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ========================================================= */

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }

  function selectAll() {
    setSelected(items.map((i) => i.ID_NUMBER));
  }

  function unselectAll() {
    setSelected([]);
  }

  function updateLocal(item: NumberItem) {
    setItems((prev) =>
      prev.map((i) =>
        i.ID_NUMBER === item.ID_NUMBER ? item : i
      )
    );
  }

  /* ========================================================= */

  async function validateBulk() {
    await api.post("/numbers/structured/bulk-validate", selected);
    load();
  }

  async function rejectBulk() {
    await api.post("/numbers/structured/bulk-reject", selected);
    load();
  }

  async function save(item: NumberItem) {
    await api.put("/numbers/structured/update", {
      id_number: item.ID_NUMBER,
      label: item.LABEL,
      value: item.VALUE,
      unit: item.UNIT,
      context: item.CONTEXT,
      status: "EDITED",
    });

    load();
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
          REJECT
        </button>

      </div>

      {/* TABLE */}
      <NumbersRawTable
        items={items}
        selected={selected}
        onToggle={toggle}
        onChange={updateLocal}
        onSave={save}
      />

    </div>

  );
}
