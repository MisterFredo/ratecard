"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionTopic from "@/components/visuals/VisualSectionTopic";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateTopic() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState(""); // 🔑 HTML éditorial
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [topicId, setTopicId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     CREATE
  --------------------------------------------------------- */
  async function save() {
    if (!label.trim()) {
      alert("Label requis");
      return;
    }

    try {
      const res = await api.post("/topic/create", {
        label,
        description: description || null, // 🔑 HTML
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      });

      if (!res.id_topic) {
        alert("Erreur création topic");
        return;
      }

      setTopicId(res.id_topic);
      alert("Topic créé. Vous pouvez ajouter des visuels.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création topic");
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter un topic
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
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>

      {/* VISUALS — POST CRÉATION */}
      {topicId && (
        <VisualSectionTopic
          topicId={topicId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square
                ? `${GCS}/topics/TOPIC_${topicId}_square.jpg`
                : null
            );
            setRectUrl(
              rectangle
                ? `${GCS}/topics/TOPIC_${topicId}_rect.jpg`
                : null
            );
          }}
        />
      )}
    </div>
  );
}
