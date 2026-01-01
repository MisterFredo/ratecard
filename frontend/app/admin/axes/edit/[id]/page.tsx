"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditAxe({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/axes/${id}`);
      const a = res.axe;

      setLabel(a.LABEL);
      setDescription(a.DESCRIPTION || "");

      if (a.MEDIA_SQUARE_ID)
        setSquareUrl(`${GCS}/axes/AXE_${id}_square.jpg`);

      if (a.MEDIA_RECTANGLE_ID)
        setRectUrl(`${GCS}/axes/AXE_${id}_rect.jpg`);

      setLoading(false);
    }
    load();
  }, [id]);

  async function update() {
    setSaving(true);

    await api.put(`/axes/update/${id}`, {
      label,
      description,
      media_rectangle_id: null, // on ne modifie pas ici
      media_square_id: null,
    });

    alert("Axe mis à jour");
    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">

      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Modifier l’axe</h1>
        <Link href="/admin/axes" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded w-full h-24"
      />

      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* Visuals */}
      <VisualSection
        entityType="axe"
        entityId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(square);
          setRectUrl(rectangle);
        }}
      />
    </div>
  );
}
