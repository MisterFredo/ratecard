"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function CreateConcept() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState("");

  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  async function save() {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    if (!blocks.trim()) {
      alert("Les blocs JSON sont requis");
      return;
    }

    try {
      await api.post("/concept/create", {
        title,
        description: description || null,
        blocks,
        status,
      });

      alert("Concept créé");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création concept");
    }
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter un concept
        </h1>
        <Link href="/admin/concept" className="underline">
          ← Retour
        </Link>
      </div>

      {/* TITLE */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Titre
        </label>
        <input
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Description courte
        </label>
        <textarea
          className="border p-2 w-full rounded h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* BLOCKS JSON */}
      <div className="space-y-2 max-w-4xl">
        <label className="block text-sm font-medium">
          BLOCKS (JSON)
        </label>
        <textarea
          className="border p-3 w-full rounded h-96 font-mono text-sm"
          value={blocks}
          onChange={(e) => setBlocks(e.target.value)}
          placeholder='{"BLOCKS": [...]}'
        />
      </div>

      {/* STATUS */}
      <div className="space-y-2 max-w-sm">
        <label className="block text-sm font-medium">
          Statut
        </label>
        <select
          className="border p-2 rounded w-full"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "DRAFT" | "PUBLISHED")
          }
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
      </div>

      {/* ACTION */}
      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>
    </div>
  );
}
