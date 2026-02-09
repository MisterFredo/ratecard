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

/* =========================================================
   TYPES
========================================================= */

type EditorialKind = "NEWS" | "BRIEF";

type NewsType =
  | "ACQUISITION"
  | "CAS CLIENT"
  | "CORPORATE"
  | "EVENT"
  | "NOMINATION"
  | "PARTENARIAT"
  | "PRODUIT"
  | "THOUGHT LEADERSHIP"
  | null;

type Props = {
  title: string;
  excerpt: string;
  body: string;

  company: any | null;
  topics: any[];
  persons: ArticlePerson[];

  editorialKind: EditorialKind;
  newsType: NewsType;

  onChange: (d: {
    title?: string;
    excerpt?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: ArticlePerson[];
    editorialKind?: EditorialKind;
    newsType?: NewsType;
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsStepContent({
  title,
  excerpt,
  body,
  company,
  topics,
  persons,
  editorialKind,
  newsType,
  onChange,
  onValidate,
  saving,
}: Props) {
  /* ---------------------------------------------------------
     PERSONNES — chargées UNE FOIS
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
      } catch {
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
      {/* STRUCTURE ÉDITORIALE */}
      <div>
        <label className="block font-medium mb-1">
          Format éditorial
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={editorialKind === "NEWS"}
              onChange={() =>
                onChange({ editorialKind: "NEWS" })
              }
            />
            <span>News</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={editorialKind === "BRIEF"}
              onChange={() =>
                onChange({ editorialKind: "BRIEF" })
              }
            />
            <span>Brève</span>
          </label>
        </div>
      </div>

      {/* NEWS_TYPE (CATÉGORIE MÉTIER) */}
      <div>
        <label className="block font-medium mb-1">
          Type de news (optionnel)
        </label>

        <select
          className="border rounded p-2 w-full"
          value={newsType || ""}
          onChange={(e) =>
            onChange({
              newsType: e.target.value
                ? (e.target.value as NewsType)
                : null,
            })
          }
        >
          <option value="">— Aucun —</option>
          <option value="ACQUISITION">Acquisition</option>
          <option value="CAS CLIENT">Cas client</option>
          <option value="CORPORATE">Corporate</option>
          <option value="EVENT">Event</option>
          <option value="NOMINATION">Nomination</option>
          <option value="PARTENARIAT">Partenariat</option>
          <option value="PRODUIT">Produit</option>
          <option value="THOUGHT LEADERSHIP">
            Thought leadership
          </option>
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
          onChange={(e) =>
            onChange({ title: e.target.value })
          }
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
          onChange={(e) =>
            onChange({ excerpt: e.target.value })
          }
        />
      </div>

      {/* TEXTE LONG — UNIQUEMENT NEWS */}
      {editorialKind === "NEWS" && (
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
