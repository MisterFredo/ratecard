"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type RawNumber = {
  id_content: string;
  label: string;
  value: number;
  unit: string;
  actor: string;
  market: string;
  period: string;
};

/* ========================================================= */

export default function NumbersAssistantCreate() {

  const [items, setItems] = useState<RawNumber[]>([]);
  const [selected, setSelected] = useState<RawNumber | null>(null);

  const [types, setTypes] = useState<any[]>([]);
  const [numberType, setNumberType] = useState("");

  const [loading, setLoading] = useState(false);

  /* ========================================================= */

  async function loadRaw() {
    try {
      const res = await api.get("/numbers/raw");
      setItems(res.items || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTypes() {
    try {
      const res = await api.get("/numbers/types");
      setTypes(res.types || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadRaw();
    loadTypes();
  }, []);

  /* ========================================================= */

  async function handleCreate() {

    if (!selected || !numberType) {
      alert("Sélection + type requis");
      return;
    }

    try {

      setLoading(true);

      await api.post("/numbers", {
        value: selected.value,
        unit: selected.unit,
        id_number_type: numberType,
        zone: selected.market,
        period: selected.period,
        source_id: null, // optionnel

        // 👉 volontairement vide pour forcer choix humain
        company_ids: [],
        topic_ids: [],
        solution_ids: [],
      });

      // remove item
      setItems((prev) =>
        prev.filter((i) => i !== selected)
      );

      setSelected(null);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  /* ========================================================= */

  return (

    <div className="border rounded p-4 space-y-4">

      <h2 className="font-semibold">
        Assistant (depuis contenus)
      </h2>

      {/* ================== LIST ================== */}

      <div className="max-h-64 overflow-y-auto border p-2 space-y-2">

        {items.map((item, i) => (

          <div
            key={i}
            onClick={() => setSelected(item)}
            className={`p-2 border cursor-pointer text-sm ${
              selected === item ? "bg-blue-50" : ""
            }`}
          >
            <div className="font-medium">
              {item.label}
            </div>

            <div className="text-xs text-gray-500">
              {item.value} {item.unit} | {item.market} | {item.period}
            </div>

            <div className="text-xs text-gray-400">
              {item.actor}
            </div>

          </div>
        ))}

      </div>

      {/* ================== EDIT ================== */}

      {selected && (

        <div className="space-y-2 border p-3 rounded">

          <div className="text-sm font-medium">
            Validation
          </div>

          <div className="grid grid-cols-4 gap-2">

            <input
              value={selected.value}
              readOnly
              className="border p-2"
            />

            <input
              value={selected.unit}
              readOnly
              className="border p-2"
            />

            <input
              value={selected.market}
              readOnly
              className="border p-2"
            />

            <input
              value={selected.period}
              readOnly
              className="border p-2"
            />

          </div>

          {/* TYPE */}

          <select
            value={numberType}
            onChange={(e) => setNumberType(e.target.value)}
            className="border p-2"
          >
            <option value="">Number Type *</option>
            {types.map((t) => (
              <option key={t.id_number_type} value={t.id_number_type}>
                {t.label}
              </option>
            ))}
          </select>

          {/* ACTION */}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Création..." : "Créer ce number"}
          </button>

        </div>

      )}

    </div>
  );
}
