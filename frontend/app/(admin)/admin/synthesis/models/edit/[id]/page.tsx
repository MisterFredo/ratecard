"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Topic = {
  id_topic: string;
  label: string;
};

type Company = {
  id_company: string;
  name: string;
};

type Model = {
  id_model: string;
  name: string;
  topic_ids: string[];
  company_ids: string[];
};

export default function EditSynthesisModelPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  /* ---------------------------------------------------------
     LOAD MODEL + TOPICS + COMPANIES
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [modelRes, topicRes, companyRes] =
          await Promise.all([
            api.get("/synthesis/models"),
            api.get("/topic/list"),
            api.get("/company/list"),
          ]);

        const model: Model | undefined =
          modelRes.models?.find(
            (m: Model) => m.id_model === id
          );

        if (!model) {
          alert("Modèle introuvable");
          return;
        }

        setName(model.name);
        setSelectedTopicIds(model.topic_ids || []);
        setSelectedCompanyIds(model.company_ids || []);

        setTopics(topicRes.topics || []);
        setCompanies(companyRes.companies || []);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement modèle");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE MODEL
  --------------------------------------------------------- */
  async function save() {
    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    try {
      await api.put(`/synthesis/models/${id}`, {
        name,
        topic_ids: selectedTopicIds,
        company_ids: selectedCompanyIds,
      });

      alert("Modèle mis à jour");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour modèle");
    }
  }

  if (loading) {
    return <div>Chargement…</div>;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Modifier le modèle
        </h1>
        <Link
          href="/admin/synthesis/models"
          className="underline"
        >
          ← Retour
        </Link>
      </div>

      {/* NAME */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Nom du modèle
        </label>
        <input
          className="border rounded p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* TOPICS */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Topics suivis
        </label>

        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const selected = selectedTopicIds.includes(
              t.id_topic
            );

            return (
              <button
                key={t.id_topic}
                onClick={() =>
                  setSelectedTopicIds((prev) =>
                    selected
                      ? prev.filter(
                          (x) => x !== t.id_topic
                        )
                      : [...prev, t.id_topic]
                  )
                }
                className={`px-3 py-1 rounded text-xs border ${
                  selected
                    ? "bg-ratecard-blue text-white border-ratecard-blue"
                    : "bg-white text-gray-700"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPANIES */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Sociétés suivies
        </label>

        <div className="flex flex-wrap gap-2">
          {companies.map((c) => {
            const selected = selectedCompanyIds.includes(
              c.id_company
            );

            return (
              <button
                key={c.id_company}
                onClick={() =>
                  setSelectedCompanyIds((prev) =>
                    selected
                      ? prev.filter(
                          (x) => x !== c.id_company
                        )
                      : [...prev, c.id_company]
                  )
                }
                className={`px-3 py-1 rounded text-xs border ${
                  selected
                    ? "bg-ratecard-blue text-white border-ratecard-blue"
                    : "bg-white text-gray-700"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={save}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Enregistrer les modifications
      </button>
    </div>
  );
}
