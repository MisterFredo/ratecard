"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionPerson from "@/components/visuals/VisualSectionPerson";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";
import CompanySelector, {
  Company,
} from "@/components/admin/CompanySelector";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditPerson({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // 🔑 HTML éditorial
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Champs spécifiques Person
  const [title, setTitle] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/person/${id}`);
        const p = res.person;

        setName(p.NAME || "");
        setTitle(p.TITLE || "");
        setDescription(p.DESCRIPTION || ""); // 🔑 HTML
        setLinkedinUrl(p.LINKEDIN_URL || "");

        if (p.ID_COMPANY && p.COMPANY_NAME) {
          setCompanies([
            {
              id_company: p.ID_COMPANY,
              name: p.COMPANY_NAME,
            },
          ]);
        }

        setSquareUrl(
          p.MEDIA_PICTURE_SQUARE_ID
            ? `${GCS}/persons/PERSON_${id}_square.jpg`
            : null
        );

        setRectUrl(
          p.MEDIA_PICTURE_RECTANGLE_ID
            ? `${GCS}/persons/PERSON_${id}_rect.jpg`
            : null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement personne");
      }
      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);
    try {
      await api.put(`/person/update/${id}`, {
        name,
        title: title || null,
        description: description || null, // 🔑 HTML
        linkedin_url: linkedinUrl || null,
        id_company:
          companies.length > 0
            ? companies[0].id_company
            : null,
      });
      alert("Personne modifiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour personne");
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
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modifier la personne
        </h1>
        <Link href="/admin/person" className="underline">
          ← Retour
        </Link>
      </div>

      {/* STRUCTURE */}
      <EntityBaseForm
        values={{
          name,
          linkedinUrl,
        }}
        onChange={{
          setName,
          setLinkedinUrl,
        }}
        labels={{
          name: "Nom complet",
        }}
      />

      {/* DESCRIPTION HTML */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium">
          Description éditoriale
        </label>

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

      {/* TITLE / ROLE */}
      <div className="max-w-2xl">
        <label className="block text-sm font-medium mb-1">
          Fonction / Titre
        </label>
        <input
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Head of Marketing, CEO, Directeur Data…"
        />
      </div>

      {/* COMPANY SELECTOR */}
      <div className="max-w-2xl">
        <CompanySelector
          values={companies}
          onChange={setCompanies}
        />
        <p className="text-xs text-gray-500 mt-1">
          Une seule société sera associée (première sélectionnée).
        </p>
      </div>

      {/* ACTION */}
      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS */}
      <VisualSectionPerson
        personId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square
              ? `${GCS}/persons/PERSON_${id}_square.jpg`
              : null
          );
          setRectUrl(
            rectangle
              ? `${GCS}/persons/PERSON_${id}_rect.jpg`
              : null
          );
        }}
      />
    </div>
  );
}
