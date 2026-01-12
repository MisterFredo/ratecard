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

export default function CreateSynthesisModelPage() {
  const [name, setName] = useState("");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  /* ---------------------------------------------------------
     LOAD TOPICS / COMPANIES
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const [tRes, cRes] = await Promise.all([
          api.get("/topic/list"),
          api.get("/company/list"),
        ]);

        setTopics(tRes.topics || []);
        setCompanies(cRes.companies || []);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement topics / sociétés");
      }
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     CREATE MODEL
  --------------------------------------------------------- */
  async function save() {
    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    try {
      const res = await api.post("/synthesis/models", {
        name,
        topic_ids: selectedTopicIds,
        company_ids: selectedCompanyIds,
      });

      if (!res.id_model) {
        alert("Erreur création modèle");
        return;
      }

      alert("Modèle créé");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création modèle");
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Nouveau modèle de synthèse
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
          placeholder="Ex : CTV – Marché / Taboola – Veille"
        />
      </div>

      {/* TOPICS */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Topics suivis
        </label>

        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const selected = selectedTopicIds.includes(t.id_topic);

            return (
              <button
                key={t.id_topic}
                onClick={() =>
                  setSelectedTopicIds((prev) =>
                    selected
                      ? prev.filter((x) => x !== t.id_topic)
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
        Créer le modèle
      </button>
    </div>
  );
}
