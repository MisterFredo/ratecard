// frontend/components/admin/AxesEditor.tsx

"use client";

import { useState } from "react";

export default function AxesEditor({ values, onChange }) {
  const [input, setInput] = useState("");

  function addTag() {
    if (!input.trim()) return;
    onChange([...values, input.trim()]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(values.filter(t => t !== tag));
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Axes (topics / company tags / product)</label>

      <div className="flex space-x-2">
        <input
          className="border p-2 flex-1"
          placeholder="Ajouter un axe..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={addTag}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center space-x-1"
          >
            <span>{tag}</span>
            <button
              onClick={() => removeTag(tag)}
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
