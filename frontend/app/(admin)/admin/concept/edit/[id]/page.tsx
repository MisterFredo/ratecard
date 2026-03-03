"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Topic = {
  ID_TOPIC: string;
  LABEL: string;
};

export default function EditConcept({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [TITLE, setTITLE] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [CONTENT, setCONTENT] = useState("");
  const [STATUS, setSTATUS] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [ID_TOPIC, setID_TOPIC] = useState<string | null>(null);

  const [topics, setTopics] = useState<Topic[]>([]);

  /* ---------------------------------------------------------
     LOAD TOPICS
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     LOAD CONCEPT
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const concept = await api.get(`/concept/${id}`);

        setTITLE(concept.TITLE || "");
        setDESCRIPTION(concept.DESCRIPTION || "");
        setCONTENT(concept.CONTENT || "");
        setSTATUS(concept.STATUS || "DRAFT");
        setID_TOPIC(concept.ID_TOPIC || null);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement concept");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    if (!TITLE.trim()) {
      alert("Titre requis");
      return;
    }

    if (!CONTENT.trim()) {
      alert("Le contenu est requis");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/concept/update/${id}`, {
        TITLE,
        DESCRIPTION: DESCRIPTION || null,
        CONTENT,
        STATUS,
        ID_TOPIC: ID_TOPIC || null,
      });

      alert("Concept mis à jour");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour concept");
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Modifier le concept
        </h1>
        <Link href="/admin/concept" className="underline">
          ← Retour
        </Link>
      </div>

      {/* TITLE */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Titre
        </label>
        <input
          className="border p-2 w-full rounded"
          value={TITLE}
          onChange={(e) => setTITLE(e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2 max-w-3xl">
        <label className="block text-sm font-medium">
          Description courte
        </label>
        <textarea
          className="border p-2 w-full rounded h-24"
          value={DESCRIPTION}
          onChange={(e) => setDESCRIPTION(e.target.value)}
        />
      </div>

      {/* TOPIC (0 ou 1) */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Topic (optionnel)
        </label>

        <select
          className="border p-2 rounded w-full"
          value={ID_TOPIC || ""}
          onChange={(e) =>
            setID_TOPIC(e.target.value || null)
          }
        >
          <option value="">— Aucun topic —</option>
          {topics.map((t) => (
            <option key={t.ID_TOPIC} value={t.ID_TOPIC}>
              {t.LABEL}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Contenu complet
        </label>

        <HtmlEditor
          value={CONTENT}
          onChange={setCONTENT}
        />
      </div>

      {/* STATUS */}
      <div className="space-y-2 max-w-sm">
        <label className="block text-sm font-medium">
          Statut
        </label>
        <select
          className="border p-2 rounded w-full"
          value={STATUS}
          onChange={(e) =>
            setSTATUS(e.target.value as "DRAFT" | "PUBLISHED")
          }
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>
      </div>

      {/* ACTION */}
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
