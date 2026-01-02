"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionTopic from "@/components/visuals/VisualSectionTopic";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditTopic({ params }: { params: { id: string } }) {
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
  // LOAD TOPIC
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/topic/${id}`);
        const t = res.topic;

        setLabel(t.LABEL);
        setDescription(t.DESCRIPTION || "");
        setSeoTitle(t.SEO_TITLE || "");
        setSeoDescription(t.SEO_DESCRIPTION || "");

        setSquareUrl(
          t.MEDIA_SQUARE_ID
            ? `${GCS}/topics/TOPIC_${id}_square.jpg`
            : null
        );

        setRectUrl(
          t.MEDIA_RECTANGLE_ID
            ? `${GCS}/topics/TOPIC_${id}_rect.jpg`
            : null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement topic");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------
  // SAVE (UPDATE)
  // ---------------------------------------------------------
  async function save() {
    setSaving(true);

    try {
      await api.put(`/topic/update/${id}`, {
        label,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      });

      alert("Topic modifié");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour topic");
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
        <h1 className="text-3xl font-semibold">Modifier le topic</h1>
        <Link href="/admin/topic" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-28"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-20"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.target.value)}
      />

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS — POST CREATION */}
      <VisualSectionTopic
        topicId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square ? `${GCS}/topics/TOPIC_${id}_square.jpg` : null
          );
          setRectUrl(
            rectangle ? `${GCS}/topics/TOPIC_${id}_rect.jpg` : null
          );
        }}
      />
    </div>
  );
}
