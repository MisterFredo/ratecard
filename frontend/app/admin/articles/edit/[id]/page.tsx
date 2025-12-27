"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import HtmlEditor from "@/components/admin/HtmlEditor";

import MediaPicker from "@/components/admin/MediaPicker";
import ArticleImageUploader from "@/components/admin/ArticleImageUploader";

export default function EditArticle({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // BASIC FIELDS
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  // ENTITIES
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);
  const [axes, setAxes] = useState<any[]>([]);

  /* ---------------------------------------------------------
     VISUEL — 3 modes = media / upload / ia
  --------------------------------------------------------- */
  type VisualMode = "media" | "upload" | "ia";
  const [visualMode, setVisualMode] = useState<VisualMode>("upload");

  const [visuelUrl, setVisuelUrl] = useState("");
  const [visuelSquareUrl, setVisuelSquareUrl] = useState("");

  function resetVisual() {
    setVisuelUrl("");
    setVisuelSquareUrl("");
  }

  function selectMode(mode: VisualMode) {
    resetVisual();
    setVisualMode(mode);
  }

  function autodetectMode(url: string): VisualMode {
    if (!url) return "upload";

    if (
      url.includes("/media/logos") ||
      url.includes("/media/logos-cropped") ||
      url.includes("/media/generics")
    ) {
      return "media";
    }

    if (url.includes("/media/articles/generated")) {
      return "ia";
    }

    if (url.includes("/media/articles/")) {
      return "upload";
    }

    return "upload";
  }

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      // BASIC
      setTitle(a.TITRE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENU_HTML || "");

      // VISUEL
      setVisuelUrl(a.VISUEL_URL || "");
      setVisuelSquareUrl(a.VISUEL_SQUARE_URL || "");

      // AUTO-DETECT VISUAL MODE
      setVisualMode(autodetectMode(a.VISUEL_URL || ""));

      // COMPANY
      if (a.companies?.length > 0) {
        const cid = a.companies[0];
        const companyRes = await api.get(`/company/${cid}`);
        setSelectedCompany(companyRes.company);
      }

      // PERSONS
      if (a.persons) {
        const personObjects = [];
        for (const person of a.persons) {
          const p = await api.get(`/person/${person.ID_PERSON}`);
          personObjects.push({
            id_person: p.person.ID_PERSON,
            name: p.person.NAME,
            title: p.person.TITLE,
          });
        }
        setSelectedPersons(personObjects);
      }

      // AXES
      setAxes(
        (a.axes || []).map((ax: any) => ({
          id_axe: ax.ID_AXE,
          label: ax.AXE_VALUE,
        }))
      );

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     IA VISUEL
  --------------------------------------------------------- */
  const [savingIA, setSavingIA] = useState(false);

  async function generateIA() {
    if (!title && !excerpt)
      return alert("Merci de renseigner un titre ou résumé");

    setSavingIA(true);

    const payload = {
      title,
      excerpt,
      axes: axes.map((a) => a.label),
      company: selectedCompany?.name || null,
    };

    const res = await api.post("/api/media/generate", payload);

    if (res.status === "ok") {
      setVisuelUrl(res.items.rectangle.url);
      setVisuelSquareUrl(res.items.square.url);
    }

    setSavingIA(false);
  }

  /* ---------------------------------------------------------
     SAVE ARTICLE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt,
      contenu_html: contentHtml,

      visuel_url: visuelUrl,
      visuel_square_url: visuelSquareUrl,

      axes: axes.map((a) => ({ value: a.label })),
      companies: selectedCompany ? [selectedCompany.ID_COMPANY] : [],
      persons: selectedPersons.map((p) => ({ id_person: p.id_person })),

      auteur: null,
    };

    const res = await api.put(`/articles/update/${id}`, payload);
    setSaving(false);

    alert("Article mis à jour !");
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’article
        </h1>
        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* BASIC FIELDS */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <textarea
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        className="border p-2 rounded w-full h-24"
      />

      <HtmlEditor value={contentHtml} onChange={setContentHtml} />

      <CompanySelector value={selectedCompany} onChange={setSelectedCompany} />
      <PersonSelector values={selectedPersons} onChange={setSelectedPersons} />
      <AxesEditor values={axes} onChange={setAxes} />

      {/* ---------------------------------------------------------
          VISUEL : 3 modes modernes
      --------------------------------------------------------- */}
      <div className="p-4 border rounded bg-white space-y-4">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Visuel de l’article
        </h2>

        {/* ONGLET DE MODE */}
        <div className="flex gap-4 border-b pb-2">
          <button
            className={`pb-1 ${
              visualMode === "media"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => selectMode("media")}
          >
            Médiathèque
          </button>

          <button
            className={`pb-1 ${
              visualMode === "upload"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => selectMode("upload")}
          >
            Upload
          </button>

          <button
            className={`pb-1 ${
              visualMode === "ia"
                ? "border-b-2 border-ratecard-blue font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => selectMode("ia")}
          >
            Génération IA
          </button>
        </div>

        {/* MODE 1 — Médiathèque */}
        {visualMode === "media" && (
          <MediaPicker
            open={true}
            onClose={() => {}}
            category="generics"
            onSelect={(item) => {
              setVisuelUrl(item.url);
              setVisuelSquareUrl("");
            }}
          />
        )}

        {/* MODE 2 — Upload local */}
        {visualMode === "upload" && (
          <ArticleImageUploader
            onUploadComplete={({ rectangle_url, square_url }) => {
              setVisuelUrl(rectangle_url);
              setVisuelSquareUrl(square_url);
            }}
          />
        )}

        {/* MODE 3 — IA */}
        {visualMode === "ia" && (
          <button
            className="bg-ratecard-blue text-white px-3 py-2 rounded"
            onClick={generateIA}
            disabled={savingIA}
          >
            {savingIA ? "Génération…" : "Générer IA"}
          </button>
        )}

        {/* PREVIEW */}
        {visuelUrl && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
            <img
              src={visuelUrl}
              className="w-80 border rounded bg-white"
            />
          </div>
        )}
      </div>

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>
    </div>
  );
}



