"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function CreateTopic() {

  const [label, setLabel] = useState("");
  const [topicAxis, setTopicAxis] =
    useState<"MEDIA" | "RETAIL" | "FOUNDATIONS">("MEDIA");

  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  /* ---------------------------------------------------------
     CREATE
  --------------------------------------------------------- */
  async function save() {

    if (!label.trim()) {
      alert("Label requis");
      return;
    }

    try {

      setLoading(true);

      const res = await api.post("/topic/create", {
        label,
        topic_axis: topicAxis,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      });

      if (!res.id_topic) {
        alert("Erreur création topic");
        return;
      }

      setCreatedId(res.id_topic);

      alert("Topic créé avec succès");

      // reset formulaire
      setLabel("");
      setTopicAxis("MEDIA");
      setDescription("");
      setSeoTitle("");
      setSeoDescription("");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur création topic");

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
          Ajouter un topic
        </h1>

        <Link href="/admin/topic" className="underline">
          ← Retour
        </Link>
      </div>

      {/* LABEL */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Label
        </label>

        <input
          className="border p-2 w-full rounded"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      {/* AXIS */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Axe du topic
        </label>

        <select
          className="border p-2 rounded w-full"
          value={topicAxis}
          onChange={(e) =>
            setTopicAxis(
              e.target.value as "MEDIA" | "RETAIL" | "FOUNDATIONS"
            )
          }
        >
          <option value="MEDIA">
            MEDIA — canaux, formats, environnements publicitaires
          </option>

          <option value="RETAIL">
            RETAIL — e-commerce, marketplaces, retail media
          </option>

          <option value="FOUNDATIONS">
            FOUNDATIONS — data, mesure, stratégie, IA
          </option>
        </select>
      </div>

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
        disabled={loading}
        className="bg-ratecard-blue px-4 py-2 text-white rounded disabled:opacity-50"
      >
        {loading ? "Création…" : "Créer"}
      </button>

      {createdId && (
        <p className="text-green-600 text-sm">
          Topic créé (ID : {createdId})
        </p>
      )}

    </div>
  );
}
