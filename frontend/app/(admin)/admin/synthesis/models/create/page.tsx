"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

/* =========================================================
   TYPES — ALIGNÉS BACKEND
========================================================= */

type Topic = {
  ID_TOPIC: string;
  LABEL: string;
};

type Company = {
  ID_COMPANY: string;
  NAME: string;
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
      {/* HEADER */}
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
          placeholder="Ex : Retail Media / Taboola – Veille"
        />
      </div>

      {/* TOPICS */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Topics suivis
        </label>

        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const selected = selectedTopicIds.includes(t.ID_TOPIC);

            return (
              <button
                key={t.ID_TOPIC}
                onClick={() =>
                  setSelectedTopicIds((prev) =>
                    selected
                      ? prev.filter((x) => x !== t.ID_TOPIC)
                      : [...prev, t.ID_TOPIC]
                  )
                }
                className={`px-3 py-1 rounded text-xs border ${
                  selected
                    ? "bg-ratecard-blue text-white border-ratecard-blue"
                    : "bg-white text-gray-700"
                }`}
              >
                {t.LABEL}
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
              c.ID_COMPANY
            );

            return (
              <button
                key={c.ID_COMPANY}
                onClick={() =>
                  setSelectedCompanyIds((prev) =>
                    selected
                      ? prev.filter(
                          (x) => x !== c.ID_COMPANY
                        )
                      : [...prev, c.ID_COMPANY]
                  )
                }
                className={`px-3 py-1 rounded text-xs border ${
                  selected
                    ? "bg-ratecard-blue text-white border-ratecard-blue"
                    : "bg-white text-gray-700"
                }`}
              >
                {c.NAME}
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
