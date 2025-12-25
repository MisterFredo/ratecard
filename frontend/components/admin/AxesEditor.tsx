"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AxesEditor({ values, onChange }) {
  const [axes, setAxes] = useState([]);
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Charger tous les axes
  useEffect(() => {
    api.get("/axes/list").then((res) => {
      setAxes(res.axes || []);
    });
  }, []);

  // Auto-complétion
  useEffect(() => {
    if (!input.trim()) {
      setFiltered([]);
      return;
    }
    const l = input.toLowerCase();
    setFiltered(
      axes.filter((a) => a.LABEL.toLowerCase().includes(l))
    );
  }, [input, axes]);

  // Ajouter un axe existant
  function addAxe(axe) {
    if (values.find((v) => v.LABEL === axe.LABEL)) return;
    onChange([...values, axe]);
    setInput("");
    setFiltered([]);
  }

  // Ajouter un axe libre (TOPIC par défaut)
  function addFree() {
    if (!input.trim()) return;
    const axe = {
      TYPE: "TOPIC",
      LABEL: input.trim(),
      ID_AXE: null,
    };
    addAxe(axe);
  }

  function removeAxe(label) {
    onChange(values.filter((v) => v.LABEL !== label));
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Axes éditoriaux</label>

      <input
        className="border p-2 w-full"
        placeholder="Rechercher ou ajouter un axe…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Suggestions */}
      {filtered.length > 0 && (
        <div className="border p-2 bg-white rounded shadow max-h-60 overflow-auto">
          {filtered.map((f) => (
            <div
              key={f.ID_AXE}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
              onClick={() => addAxe(f)}
            >
              <span>{f.LABEL}</span>
              <span className="text-xs text-gray-500">{f.TYPE}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ajouter axe libre */}
      {input.trim() !== "" && filtered.length === 0 && (
        <button
          onClick={addFree}
          className="bg-black text-white px-4 py-1 rounded text-sm"
        >
          Ajouter “{input}”
        </button>
      )}

      {/* Tags sélectionnés */}
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v) => (
          <span
            key={v.LABEL}
            className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"
          >
            <span>{v.LABEL}</span>
            <span className="text-[10px] text-gray-600">({v.TYPE})</span>
            <button
              onClick={() => removeAxe(v.LABEL)}
              className="text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
