"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import ConceptBlocksEditor, {
  ConceptBlock,
} from "@/components/admin/ConceptBlocksEditor";

export default function CreateConcept() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const [blocks, setBlocks] = useState<ConceptBlock[]>([
    {
      title: "Définition / Contexte",
      icon: "📘",
      content: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    if (!blocks.length) {
      alert("Au moins un bloc est requis");
      return;
    }

    const emptyBlock = blocks.find(
      (b) => !b.title.trim() || !b.content.trim()
    );

    if (emptyBlock) {
      alert("Tous les blocs doivent être complétés");
      return;
    }

    try {
      setLoading(true);

      await api.post("/concept/create", {
        title,
        description: description || null,
        blocks: JSON.stringify({ BLOCKS: blocks }),
        status,
      });

      alert("Concept créé avec succès");

      // reset form
      setTitle("");
      setDescription("");
      setStatus("DRAFT");
      setBlocks([
        {
          title: "Définition / Contexte",
          icon: "📘",
          content: "",
        },
      ]);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création concept");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-center">
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
          placeholder="Ex : Retail Media, Viewability, ID Graph..."
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2 max-w-3xl">
        <label className="block text-sm font-medium">
          Description courte
        </label>
        <textarea
          className="border p-2 w-full rounded h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Résumé synthétique du concept (1–2 phrases)"
        />
      </div>

      {/* BLOCKS EDITOR */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Blocs éditoriaux
        </h2>

        <ConceptBlocksEditor
          value={blocks}
          onChange={setBlocks}
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
        disabled={loading}
        className="bg-ratecard-blue px-6 py-2 text-white rounded disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer le concept"}
      </button>
    </div>
  );
}
