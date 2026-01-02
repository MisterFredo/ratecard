"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionTopic from "@/components/visuals/VisualSectionTopic";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateTopic() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [topicId, setTopicId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  async function save() {
    if (!label.trim()) {
      alert("Label requis");
      return;
    }

    const res = await api.post("/topic/create", {
      label,
      description: description || null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
    });

    if (!res.id_topic) {
      alert("Erreur création topic");
      return;
    }

    setTopicId(res.id_topic);
    alert("Topic créé. Vous pouvez ajouter des visuels.");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Ajouter un topic</h1>
        <Link href="/admin/topic" className="underline">← Retour</Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-28"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="SEO title"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-20"
        placeholder="SEO description"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>

      {topicId && (
        <VisualSectionTopic
          topicId={topicId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square ? `${GCS}/topics/TOPIC_${topicId}_square.jpg` : null
            );
            setRectUrl(
              rectangle ? `${GCS}/topics/TOPIC_${topicId}_rect.jpg` : null
            );
          }}
        />
      )}
    </div>
  );
}
