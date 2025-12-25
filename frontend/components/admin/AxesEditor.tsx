"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AxesEditor({ values, onChange }) {
  const [input, setInput] = useState("");
  const [axes, setAxes] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    api.get("/axes/list").then((res) => {
      setAxes(res.axes || []);
    });
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setFiltered([]);
      return;
    }
    const l = input.toLowerCase();
    setFiltered(axes.filter((a) => a.LABEL.toLowerCase().includes(l)));
  }, [input, axes]);

  function addLabel(label: string) {
    if (!label.trim() || values.includes(label)) return;
    onChange([...values, label]);
    setInput("");
    setFiltered([]);
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Axes</label>

      {/* Input */}
      <input
        className="border p-2 w-full"
        placeholder="Ajouter un axe…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Suggestions */}
      {filtered.length > 0 && (
        <div className="border p-2 bg-white rounded shadow">
          {filtered.map((f) => (
            <div
              key={f.ID_AXE}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => addLabel(f.LABEL)}
            >
              {f.LABEL}
              <span className="text-gray-500 text-xs ml-2">({f.TYPE})</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {values.map((label) => (
          <span
            key={label}
            className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1"
          >
            {label}
            <button
              onClick={() => onChange(values.filter((v) => v !== label))}
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
