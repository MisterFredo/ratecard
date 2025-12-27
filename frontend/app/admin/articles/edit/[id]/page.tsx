"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import AxesEditor from "@/components/admin/AxesEditor";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function EditArticle({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // BASIC FIELDS
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  // COMPANY = object
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // PERSON = array of objects
  const [selectedPersons, setSelectedPersons] = useState<any[]>([]);

  // AXES = array of { id_axe, label }
  const [axes, setAxes] = useState<any[]>([]);

  // MEDIA (URL + ID)
  const [visuelUrl, setVisuelUrl] = useState("");
  const [visuelSquareUrl, setVisuelSquareUrl] = useState("");

  const [visuelId, setVisuelId] = useState<string | null>(null);
  const [visuelSquareId, setVisuelSquareId] = useState<string | null>(null);

  const [pickerVisuelOpen, setPickerVisuelOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* ============================================================
     LOAD ARTICLE
  ============================================================ */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/articles/${id}`);
      const a = res.article;

      setTitle(a.TITRE || "");
      setExcerpt(a.EXCERPT || "");
      setContentHtml(a.CONTENU_HTML || "");

      // VISUELS — anciens champs, en attendant la refonte totale ARTICLES
      setVisuelUrl(a.VISUEL_URL || "");
      setVisuelSquareUrl(a.VISUEL_SQUARE_URL || "");

      // COMPANY (string → object map)
      // Dans l'ancien backend, companies était une liste d'IDs
      if (a.companies && a.companies.length > 0) {
        const companyId = a.companies[0];
        const companyRes = await api.get(`/company/${companyId}`);
        setSelectedCompany(companyRes.company);
      }

      // PERSONS (IDs → objects pour PersonSelector)
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

      // AXES (anciennes données → conversion)
      setAxes(
        (a.axes || []).map((ax: any) => ({
          id_axe: ax.ID_AXE || null,
          label: ax.AXE_VALUE,
        }))
      );

      setLoading(false);
    }

    load();
  }, [id]);

  /* ============================================================
     IA VISUEL
  ============================================================ */
  async function generateIA() {
    if (!title && !excerpt) return alert("Merci de renseigner un titre ou résumé");

    setSaving(true);

    const payload = {
      title,
      excerpt,
      axes: axes.map(a => a.label),
      company: selectedCompany?.name || null,
    };

    const res = await api.post("/api/media/generate", payload);

    if (res.status === "ok") {
      setVisuelUrl(res.items.rectangle.url);
      setVisuelId(res.items.rectangle.media_id);

      setVisuelSquareUrl(res.items.square.url);
      setVisuelSquareId(res.items.square.media_id);
    }

    setSaving(false);
    return;
  }

  /* ============================================================
     SAVE ARTICLE (PROVISOIRE)
     → On ne touche pas encore au backend tant que MEDIA/AXES/PERSON
       refonte n’est pas terminée.
  ============================================================ */
  async function save() {
    setSaving(true);

    const payload = {
      titre: title,
      excerpt,
      contenu_html: contentHtml,

      visuel_url: visuelUrl,
      visuel_square_url: visuelSquareUrl,

      axes: axes.map(a => ({ value: a.label })),
      companies: selectedCompany ? [selectedCompany.ID_COMPANY] : [],
      persons: selectedPersons.map(p => ({ id_person: p.id_person })),

      auteur: null,
    };

    const res = await api.put(`/articles/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  /* ============================================================
     RENDER
  ============================================================ */
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

      {/* ENTITIES */}
      <CompanySelector value={selectedCompany} onChange={setSelectedCompany} />
      <PersonSelector values={selectedPersons} onChange={setSelectedPersons} />
      <AxesEditor values={axes} onChange={setAxes} />

      {/* VISUELS */}
      <div className="space-y-4 p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Visuel de l’article
        </h2>

        <div className="flex gap-3">
          <button
            className="bg-ratecard-green text-white px-3 py-2 rounded"
            onClick={() => setPickerVisuelOpen(true)}
          >
            Choisir dans la médiathèque
          </button>

          <button
            className="bg-gray-700 text-white px-3 py-2 rounded"
            onClick={() => setUploaderOpen(true)}
          >
            Uploader un visuel
          </button>

          <button
            className="bg-ratecard-blue text-white px-3 py-2 rounded"
            onClick={generateIA}
            disabled={saving}
          >
            {saving ? "Génération…" : "Générer via IA"}
          </button>
        </div>

        {visuelUrl && (
          <div className="mt-2">
            <img src={visuelUrl} className="w-80 border rounded bg-white" />
          </div>
        )}
      </div>

      {/* PICKER MEDIA */}
      <MediaPicker
        open={pickerVisuelOpen}
        onClose={() => setPickerVisuelOpen(false)}
        category="articles"
        onSelect={(item) => {
          if (item.format === "square") {
            setVisuelSquareUrl(item.url);
            setVisuelSquareId(item.media_id);
          } else {
            setVisuelUrl(item.url);
            setVisuelId(item.media_id);
          }
        }}
      />

      {/* UPLOADER */}
      {uploaderOpen && (
        <MediaUploader
          category="articles"
          onUploadComplete={({ square, rectangle }) => {
            setVisuelSquareUrl(square.url);
            setVisuelSquareId(square.media_id);

            setVisuelUrl(rectangle.url);
            setVisuelId(rectangle.media_id);

            setUploaderOpen(false);
          }}
        />
      )}

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}


