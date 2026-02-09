"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector, {
  PersonRef,
  ArticlePerson,
} from "@/components/admin/PersonSelector";

import HtmlEditor from "@/components/admin/HtmlEditor";

type NewsType = "NEWS" | "BRIEF";

type Props = {
  title: string;
  excerpt: string;
  body: string;

  company: any | null;
  topics: any[];
  persons: ArticlePerson[];

  newsType: NewsType;

  onChange: (d: {
    title?: string;
    excerpt?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: ArticlePerson[];
    newsType?: NewsType;
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

export default function NewsStepContent({
  title,
  excerpt,
  body,
  company,
  topics,
  persons,
  newsType,
  onChange,
  onValidate,
  saving,
}: Props) {
  /* ---------------------------------------------------------
     PERSONNES — chargées UNE FOIS
  --------------------------------------------------------- */
  const [allPersons, setAllPersons] = useState<PersonRef[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(true);

  useEffect(() => {
    async function loadPersons() {
      try {
        const res = await api.get("/person/list");
        setAllPersons(
          (res.persons || []).map((p: any) => ({
            id_person: p.ID_PERSON,
            name: p.NAME,
            title: p.TITLE || "",
            id_company: p.ID_COMPANY || null,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement personnes", e);
        setAllPersons([]);
      } finally {
        setLoadingPersons(false);
      }
    }

    loadPersons();
  }, []);

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* =====================================================
          TYPE DE CONTENU
      ===================================================== */}
      <div className="border rounded p-4 bg-gray-50">
        <label className="block font-medium mb-2">
          Type de contenu
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={newsType === "NEWS"}
              onChange={() =>
                onChange({ newsType: "NEWS" })
              }
            />
            <span className="font-medium">News</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={newsType === "BRIEF"}
              onChange={() =>
                onChange({ newsType: "BRIEF" })
              }
            />
            <span className="font-medium">Brève</span>
          </label>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {newsType === "BRIEF"
            ? "Une brève est un signal court (titre + excerpt), sans article détaillé."
            : "Une news est un contenu éditorial complet avec texte long et visuel."}
        </p>
      </div>

      {/* =====================================================
          SOCIÉTÉ (OBLIGATOIRE)
      ===================================================== */}
      <CompanySelector
        values={company ? [company] : []}
        onChange={(items) => {
          onChange({ company: items[0] || null });
          // reset personnes si la société change
          onChange({ persons: [] });
        }}
      />

      {/* =====================================================
          TITRE
      ===================================================== */}
      <div>
        <label className="block font-medium mb-1">
          Titre *
        </label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) =>
            onChange({ title: e.target.value })
          }
        />
      </div>

      {/* =====================================================
          EXCERPT (OBLIGATOIRE)
      ===================================================== */}
      <div>
        <label className="block font-medium mb-1">
          Excerpt *
        </label>
        <textarea
          className="w-full border rounded p-2 h-24"
          value={excerpt}
          onChange={(e) =>
            onChange({ excerpt: e.target.value })
          }
          placeholder={
            newsType === "BRIEF"
              ? "Texte court affiché tel quel dans les brèves"
              : "Résumé court affiché sur la Home et les listes"
          }
        />
      </div>

      {/* =====================================================
          TEXTE LONG — UNIQUEMENT POUR NEWS
      ===================================================== */}
      {newsType === "NEWS" && (
        <div>
          <label className="block font-medium mb-1">
            Texte
          </label>
          <HtmlEditor
            value={body}
            onChange={(html) =>
              onChange({ body: html })
            }
          />
        </div>
      )}

      {/* =====================================================
          TOPICS
      ===================================================== */}
      <TopicSelector
        values={topics}
        onChange={(items) =>
          onChange({ topics: items })
        }
      />

      {/* =====================================================
          PERSONNES
      ===================================================== */}
      <PersonSelector
        values={persons}
        persons={allPersons}
        companyId={
          company?.id_company ||
          company?.ID_COMPANY ||
          null
        }
        onChange={(items) =>
          onChange({ persons: items })
        }
      />

      {/* =====================================================
          ACTION
      ===================================================== */}
      <div className="pt-4">
        <button
          onClick={onValidate}
          disabled={saving}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
