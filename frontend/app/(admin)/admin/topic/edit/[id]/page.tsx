"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionTopic from "@/components/visuals/VisualSectionTopic";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditTopic({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState(""); // 🔑 HTML éditorial
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/topic/${id}`);
        const t = res.topic;

        setLabel(t.LABEL || "");
        setDescription(t.DESCRIPTION || ""); // 🔑 HTML
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

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);

    try {
      await api.put(`/topic/update/${id}`, {
        label,
        description: description || null, // 🔑 HTML
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

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modifier le topic
        </h1>
        <Link href="/admin/topic" className="underline">
          ← Retour
        </Link>
      </div>

      {/* STRUCTURE */}
      <EntityBaseForm
        values={{ name: label }}
        onChange={{ setName: setLabel }}
        labels={{ name: "Label" }}
      />

      {/* DESCRIPTION HTML */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Description éditoriale
        </label>

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

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
            onChange={(e) =>
              setSeoDescription(e.target.value)
            }
            placeholder="Description meta (optionnelle)"
          />
        </div>
      </div>

      {/* ACTION */}
      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS */}
      <VisualSectionTopic
        topicId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square
              ? `${GCS}/topics/TOPIC_${id}_square.jpg`
              : null
          );
          setRectUrl(
            rectangle
              ? `${GCS}/topics/TOPIC_${id}_rect.jpg`
              : null
          );
        }}
      />
    </div>
  );
}
