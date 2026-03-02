"use client";

import { useState } from "react";
import HtmlEditor from "@/components/admin/HtmlEditor";

export type ConceptBlock = {
  title: string;
  icon: string;
  content: string;
};

type Props = {
  value: ConceptBlock[];
  onChange: (blocks: ConceptBlock[]) => void;
};

export default function ConceptBlocksEditor({
  value,
  onChange,
}: Props) {
  function updateBlock(index: number, field: keyof ConceptBlock, val: string) {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  }

  function addBlock() {
    onChange([
      ...value,
      { title: "", icon: "📄", content: "" },
    ]);
  }

  function removeBlock(index: number) {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div className="space-y-8">
      {value.map((block, index) => (
        <div
          key={index}
          className="border rounded p-4 space-y-4 bg-gray-50"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">
              Bloc {index + 1}
            </h3>
            <button
              onClick={() => removeBlock(index)}
              className="text-red-500 text-sm"
            >
              Supprimer
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Titre
            </label>
            <input
              className="border p-2 w-full rounded"
              value={block.title}
              onChange={(e) =>
                updateBlock(index, "title", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Icône
            </label>
            <input
              className="border p-2 w-full rounded"
              value={block.icon}
              onChange={(e) =>
                updateBlock(index, "icon", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Contenu
            </label>
            <HtmlEditor
              value={block.content}
              onChange={(val) =>
                updateBlock(index, "content", val)
              }
            />
          </div>
        </div>
      ))}

      <button
        onClick={addBlock}
        className="bg-gray-200 px-4 py-2 rounded"
      >
        + Ajouter un bloc
      </button>
    </div>
  );
}
