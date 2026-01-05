"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionEvent from "@/components/visuals/VisualSectionEvent";
import EntityBaseForm from "@/components/forms/EntityBaseForm";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditEvent({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/event/${id}`);
        const e = res.event;

        setLabel(e.LABEL);
        setDescription(e.DESCRIPTION || "");
        setSeoTitle(e.SEO_TITLE || "");
        setSeoDescription(e.SEO_DESCRIPTION || "");

        setSquareUrl(
          e.MEDIA_SQUARE_ID
            ? `${GCS}/events/EVENT_${id}_square.jpg`
            : null
        );

        setRectUrl(
          e.MEDIA_RECTANGLE_ID
            ? `${GCS}/events/EVENT_${id}_rect.jpg`
            : null
        );
      } catch (err) {
        console.error(err);
        alert("❌ Erreur chargement événement");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------
  async function save() {
    setSaving(true);

    try {
      await api.put(`/event/update/${id}`, {
        label,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      });

      alert("Événement modifié");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur mise à jour événement");
    }

    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modifier l’événement
        </h1>
        <Link href="/admin/event" className="underline">
          ← Retour
        </Link>
      </div>

      {/* FORM BASE (label + description) */}
      <EntityBaseForm
        values={{
          name: label,
          description,
        }}
        onChange={{
          setName: setLabel,
          setDescription,
        }}
        labels={{
          name: "Nom de l’événement",
          description: "Description éditoriale",
        }}
      />

      {/* SEO */}
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            SEO title
          </label>
          <input
            className="border p-2 w-full rounded"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Titre pour Google (optionnel)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            SEO description
          </label>
          <textarea
            className="border p-2 w-full rounded h-20"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Description meta (optionnelle)"
          />
        </div>
      </div>

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS */}
      <VisualSectionEvent
        eventId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square
              ? `${GCS}/events/EVENT_${id}_square.jpg`
              : null
          );
          setRectUrl(
            rectangle
              ? `${GCS}/events/EVENT_${id}_rect.jpg`
              : null
          );
        }}
      />
    </div>
  );
}
