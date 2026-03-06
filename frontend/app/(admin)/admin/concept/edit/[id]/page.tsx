"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Topic = {
  id_topic: string;
  label: string;
};

export default function EditConcept({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [idTopic, setIdTopic] = useState<string | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);

  /* LOAD TOPICS */
  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await api.get("/topic/list");
        setTopics(res.topics || []);
      } catch (e) {
        console.error(e);
      }
    }

    loadTopics();
  }, []);

  /* LOAD CONCEPT */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const concept = await api.get(`/concept/${id}`);

        setTitle(concept.title || "");
        setDescription(concept.description || "");
        setContent(concept.content || "");
        setStatus(concept.status || "DRAFT");
        setIdTopic(concept.id_topic || null);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement concept");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* SAVE */
  async function save() {
    if (!title.trim()) {
      alert("Titre requis");
      return;
    }

    if (!content.trim()) {
      alert("Le contenu est requis");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/concept/update/${id}`, {
        title,
        description: description || null,
        content,
        status,
        id_topic: idTopic || null,
      });

      alert("Concept mis à jour");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour concept");
    }

    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Modifier le concept
        </h1>
        <Link href="/admin/concept" className="underline">
          ← Retour
        </Link>
      </div>

      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Titre
        </label>
        <input
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-3xl">
        <label className="block text-sm font-medium">
          Description courte
        </label>
        <textarea
          className="border p-2 w-full rounded h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Topic (optionnel)
        </label>

        <select
          className="border p-2 rounded w-full"
          value={idTopic || ""}
          onChange={(e) =>
            setIdTopic(e.target.value || null)
          }
        >
          <option value="">— Aucun topic —</option>
          {topics.map((t) => (
            <option key={t.id_topic} value={t.id_topic}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Contenu complet
        </label>

        <HtmlEditor
          value={content}
          onChange={setContent}
        />
      </div>

      <div className="space-y-2 max-w-sm">
        <label className="block text-sm font-medium">
          Statut
        </label>
        <select
          className="border p-2 rounded w-full"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "DRAFT" | "PUBLISHED")
          }
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-6 py-2 text-white rounded disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
