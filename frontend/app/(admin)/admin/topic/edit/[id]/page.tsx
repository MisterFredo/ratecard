"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type TopicAxis = "MEDIA" | "RETAIL" | "FOUNDATIONS";

export default function EditTopic({ params }: { params: { id: string } }) {

  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [topicAxis, setTopicAxis] =
    useState<TopicAxis>("MEDIA");

  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [insightFrequency, setInsightFrequency] =
    useState("QUARTERLY");

  useEffect(() => {

    async function load() {

      try {

        const t = await api.get(`/topic/${id}`);

        setLabel(t.label || "");

        const axis: TopicAxis =
          t.topic_axis === "RETAIL" ||
          t.topic_axis === "FOUNDATIONS"
            ? t.topic_axis
            : "MEDIA";

        setTopicAxis(axis);

        setDescription(t.description || "");
        setSeoTitle(t.seo_title || "");
        setSeoDescription(t.seo_description || "");

        setInsightFrequency(t.insight_frequency || "QUARTERLY");

      } catch (e) {

        console.error(e);
        alert("❌ Erreur chargement topic");

      } finally {

        setLoading(false);

      }

    }

    load();

  }, [id]);

  async function save() {

    if (!label.trim()) {
      alert("Label requis");
      return;
    }

    try {

      setSaving(true);

      await api.put(`/topic/update/${id}`, {
        label,
        topic_axis: topicAxis,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        insight_frequency: insightFrequency,
      });

      alert("Topic modifié");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur mise à jour topic");

    } finally {

      setSaving(false);

    }

  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-10">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Modifier le topic
        </h1>

        <Link href="/admin/topic" className="underline">
          ← Retour
        </Link>
      </div>

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

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Axe du topic
        </label>

        <select
          className="border p-2 rounded w-full"
          value={topicAxis}
          onChange={(e) =>
            setTopicAxis(e.target.value as TopicAxis)
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

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Description éditoriale
        </label>

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Fréquence des insights
        </label>

        <select
          value={insightFrequency}
          onChange={(e) => setInsightFrequency(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-xs"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
        </select>
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
          />
        </div>

      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-4 py-2 text-white rounded disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

    </div>
  );
}
