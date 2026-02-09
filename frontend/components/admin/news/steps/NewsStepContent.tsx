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
 * NEWS_KIND  = structure éditoriale (NEWS | BRIEF)
 * NEWS_TYPE  = catégorie métier (CORPORATE, PRODUIT, etc.)
 */

type NewsKind = "NEWS" | "BRIEF";

type Props = {
  title: string;
  excerpt: string;
  body: string;

  company: any | null;
  topics: any[];
  persons: ArticlePerson[];

  newsKind: NewsKind;
  newsType?: string | null;

  onChange: (d: {
    title?: string;
    excerpt?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: ArticlePerson[];
    newsKind?: NewsKind;
    newsType?: string | null;
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

const NEWS_TYPES = [
  "ACQUISITION",
  "CAS CLIENT",
  "CORPORATE",
  "EVENT",
  "NOMINATION",
  "PARTENARIAT",
  "PRODUIT",
  "THOUGHT LEADERSHIP",
];

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
      {/* STRUCTURE ÉDITORIALE */}
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

        <p className="text-sm text-gray-500 mt-1">
          Une brève est un signal court (titre + excerpt), sans article long.
        </p>
      </div>

      {/* CATÉGORIE MÉTIER */}
      <div>
        <label className="block font-medium mb-1">
          Catégorie éditoriale
        </label>

        <select
          className="w-full border rounded p-2"
          value={newsType || ""}
          onChange={(e) =>
            onChange({
              newsType: e.target.value || null,
            })
          }
        >
          <option value="">— Aucune —</option>
          {NEWS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <p className="text-sm text-gray-500 mt-1">
          Information métier non obligatoire (corporate, produit, etc.).
        </p>
      </div>

      {/* SOCIÉTÉ (OBLIGATOIRE) */}
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
          onChange={(e) =>
            onChange({ title: e.target.value })
          }
        />
      </div>

      {/* EXCERPT */}
      <div>
        <label className="block font-medium mb-1">
          Excerpt <span className="text-sm text-gray-500">(obligatoire)</span>
        </label>
        <textarea
          className="w-full border rounded p-2 h-24"
          value={excerpt}
          onChange={(e) =>
            onChange({ excerpt: e.target.value })
          }
          placeholder={
            newsKind === "BRIEF"
              ? "Texte court affiché tel quel dans les brèves"
              : "Résumé court pour la Home et les listes"
          }
        />
      </div>

      {/* TEXTE LONG — UNIQUEMENT POUR NEWS */}
      {newsKind === "NEWS" && (
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

      {/* TOPICS */}
      <TopicSelector
        values={topics}
        onChange={(items) =>
          onChange({ topics: items })
        }
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
        onChange={(items) =>
          onChange({ persons: items })
        }
      />

      {/* ACTION */}
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
