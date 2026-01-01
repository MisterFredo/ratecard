"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanyVisualSection from "../edit/[id]/VisualSection"; 
// 🔥 Le même composant que pour Edit

export default function CreateCompanyPage() {
  // Données de la société
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // URLs visuels (gérés par CompanyVisualSection)
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,

      // Nouveau modèle :
      media_logo_square_url: squareUrl,
      media_logo_rectangle_url: rectUrl,
    };

    const res = await api.post("/company/create", payload);

    if (!res || !res.id_company) {
      alert("❌ Erreur lors de la création.");
      setSaving(false);
      return;
    }

    setCreatedId(res.id_company);
    alert("Société créée !");
    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Ajouter une société
        </h1>
        <Link href="/admin/company" className="text-gray-600 underline">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <input
        placeholder="Nom de la société"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full h-24 rounded"
      />

      {/* VISUELS : carré + rectangle générés automatiquement */}
      <CompanyVisualSection
        id_company={createdId ?? "__new__"} 
        // pour create: ID temporaire, backend renommera ensuite
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onSquareChange={setSquareUrl}
        onRectChange={setRectUrl}
        isNew={true}
      />

      {/* LINKEDIN */}
      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* WEBSITE */}
      <input
        placeholder="Site web (optionnel)"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

    </div>
  );
}
