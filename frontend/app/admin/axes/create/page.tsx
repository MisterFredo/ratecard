"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

export default function CreateAxe() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const [axeId, setAxeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!label.trim()) return alert("Nom d’axe requis");

    setSaving(true);

    const payload = {
      label,
      description: description || null,
      media_rectangle_id: null,
      media_square_id: null,
    };

    const res = await api.post("/axes/create", payload);
    if (!res.id_axe) {
      alert("Erreur création axe");
      setSaving(false);
      return;
    }

    setAxeId(res.id_axe);
    alert("Axe créé : ajoutez un visuel");
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Ajouter un axe éditorial
        </h1>
        <Link href="/admin/axes" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        placeholder="Nom de l’axe"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <textarea
        placeholder="Description (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full h-24"
      />

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Créer"}
      </button>

      {axeId && (
        <VisualSection
          entityType="axe"
          entityId={axeId}
          squareUrl=""
          rectUrl=""
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
