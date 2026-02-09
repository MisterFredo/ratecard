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

/**
 * 🔒 ALIGNEMENT STRICT
 *
 * - NEWS_KIND : structure du contenu (NEWS | BRIEF)
 * - NEWS_TYPE : catégorie rédactionnelle gouvernée (RATECARD_NEWS_TYPE.CODE)
 */

type NewsType = {
  code: string;
  label: string;
};

type Props = {
  title: string;
  excerpt: string;
  body: string;

  company: any | null;
  topics: any[];
  persons: ArticlePerson[];

  // STRUCTURE
  newsKind: "NEWS" | "BRIEF";

  // CATÉGORIE RÉDACTIONNELLE (CODE)
  newsType?: string | null;

  onChange: (d: {
    title?: string;
    excerpt?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: ArticlePerson[];
    newsKind?: "NEWS" | "BRIEF";
    newsType?: string | null;
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
  newsKind,
  newsType = null,
  onChange,
  onValidate,
  saving,
}: Props) {
  /* ---------------------------------------------------------
     NEWS_TYPE — référentiel gouverné (BQ)
  --------------------------------------------------------- */
  const [newsTypes, setNewsTypes] = useState<NewsType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    async function loadTypes() {
      try {
        const res = await api.get("/news/types");

        setNewsTypes(
          (res.types || []).map((t: any) => ({
            code: t.code,
            label: t.label,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement NEWS_TYPE", e);
        setNewsTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    }

    loadTypes();
  }, []);

  /* ---------------------------------------------------------
     PERSONNES
  --------------------------------------------------------- */
  const [allPersons, setAllPersons] = useState<PersonRef[]>([]);

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
      }
    }

    loadPersons();
  }, []);

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* STRUCTURE — NEWS / BRÈVE */}
      <div>
        <label className="block font-medium mb-1">
          Type de contenu
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={newsKind === "NEWS"}
              onChange={() => onChange({ newsKind: "NEWS" })}
            />
            <span>News</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={newsKind === "BRIEF"}
              onChange={() => onChange({ newsKind: "BRIEF" })}
            />
            <span>Brève</span>
          </label>
        </div>
      </div>

      {/* CATÉGORIE RÉDACTIONNELLE — NEWS_TYPE */}
      <div>
        <label className="block font-medium mb-1">
          Catégorie éditoriale
          <span className="text-sm text-gray-400 ml-1">
            (optionnel)
          </span>
        </label>

        <select
          className="border rounded p-2 w-full"
          disabled={loadingTypes}
          value={newsType || ""}
          onChange={(e) =>
            onChange({
              newsType: e.target.value || null,
            })
          }
        >
          <option value="">— Non renseignée —</option>

          {newsTypes.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* SOCIÉTÉ */}
      <CompanySelector
        values={company ? [company] : []}
        onChange={(items) => {
          onChange({ company: items[0] || null });
          onChange({ persons: [] });
        }}
      />

      {/* TITRE */}
      <div>
        <label className="block font-medium mb-1">
          Titre *
        </label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* EXCERPT */}
      <div>
        <label className="block font-medium mb-1">
          Excerpt *
        </label>
        <textarea
          className="w-full border rounded p-2 h-24"
          value={excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
        />
      </div>

      {/* TEXTE — UNIQUEMENT POUR NEWS */}
      {newsKind === "NEWS" && (
        <HtmlEditor
          value={body}
          onChange={(html) => onChange({ body: html })}
        />
      )}

      {/* TOPICS */}
      <TopicSelector
        values={topics}
        onChange={(items) => onChange({ topics: items })}
      />

      {/* PERSONNES */}
      <PersonSelector
        values={persons}
        persons={allPersons}
        companyId={
          company?.id_company ||
          company?.ID_COMPANY ||
          null
        }
        onChange={(items) => onChange({ persons: items })}
      />

      {/* ACTION */}
      <button
        onClick={onValidate}
        disabled={saving}
        className="bg-ratecard-green text-white px-4 py-2 rounded"
      >
        {saving ? "Sauvegarde…" : "Enregistrer"}
      </button>
    </div>
  );
}
