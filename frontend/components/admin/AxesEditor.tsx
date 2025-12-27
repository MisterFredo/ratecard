"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AxesEditor({ values, onChange }) {
  const [axes, setAxes] = useState([]);
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState([]);

  /* ---------------------------------------------------------
     LOAD ALL AXES
  --------------------------------------------------------- */
  useEffect(() => {
    api.get("/axes/list").then((res) => {
      setAxes(res.axes || []);
    });
  }, []);

  /* ---------------------------------------------------------
     FILTER ON INPUT
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     ADD EXISTING AXE
  --------------------------------------------------------- */
  function addAxe(axe) {
    if (values.find((v) => v.id_axe === axe.ID_AXE)) return;

    const updated = [
      ...values,
      {
        id_axe: axe.ID_AXE,
        label: axe.LABEL,
      },
    ];

    onChange(updated);
    setInput("");
    setFiltered([]);
  }

  /* ---------------------------------------------------------
     REMOVE AXE
  --------------------------------------------------------- */
  function removeAxe(id_axe) {
    onChange(values.filter((v) => v.id_axe !== id_axe));
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Axes éditoriaux</label>

      {/* INPUT */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Rechercher un axe…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* SUGGESTIONS */}
      {filtered.length > 0 && (
        <div className="border p-2 bg-white rounded shadow max-h-60 overflow-auto">
          {filtered.map((f) => (
            <div
              key={f.ID_AXE}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => addAxe(f)}
            >
              {f.LABEL}
            </div>
          ))}
        </div>
      )}

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((v) => (
          <span
            key={v.id_axe}
            className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-2"
          >
            <span>{v.label}</span>
            <button
              onClick={() => removeAxe(v.id_axe)}
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

