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
  const [topicAxis, setTopicAxis] = useState<"BUSINESS" | "FIELD">("BUSINESS");

  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/topic/${id}`);
        const t = res.topic;

        setLabel(t.label || "");
        setTopicAxis(t.topic_axis || "BUSINESS");
        setDescription(t.description || "");
        setSeoTitle(t.seo_title || "");
        setSeoDescription(t.seo_description || "");

        setSquareUrl(
          t.media_square_id
            ? `${GCS}/topics/${t.media_square_id}`
            : null
        );

        setRectUrl(
          t.media_rectangle_id
            ? `${GCS}/topics/${t.media_rectangle_id}`
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

  async function save() {
    setSaving(true);

    try {
      await api.put(`/topic/update/${id}`, {
        label,
        topic_axis: topicAxis,
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

  return (
    <div className="space-y-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modifier le topic
        </h1>
        <Link href="/admin/topic" className="underline">
          ← Retour
        </Link>
      </div>

      <EntityBaseForm
        values={{ name: label }}
        onChange={{ setName: setLabel }}
        labels={{ name: "Label" }}
      />

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Axe du topic
        </label>

        <select
          className="border p-2 rounded w-full"
          value={topicAxis}
          onChange={(e) =>
            setTopicAxis(e.target.value as "BUSINESS" | "FIELD")
          }
        >
          <option value="BUSINESS">
            BUSINESS — enjeux métier, stratégie, monétisation
          </option>
          <option value="FIELD">
            FIELD — canaux, terrains, environnements d’activation
          </option>
        </select>
      </div>

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Description éditoriale
        </label>

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

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

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      <VisualSectionTopic
        topicId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square
              ? `${GCS}/topics/${rectangle ? "" : ""}${square}`
              : null
          );
          setRectUrl(
            rectangle
              ? `${GCS}/topics/${rectangle}`
              : null
          );
        }}
      />
    </div>
  );
}
