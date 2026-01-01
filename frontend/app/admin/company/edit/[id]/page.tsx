"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import CompanyVisualSection from "./VisualSection";

export default function EditCompanyPage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Champs société
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // URLs visuels (stockées dans BQ)
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD COMPANY
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/company/${id}`);
      const c = res.company;

      setName(c.NAME || "");
      setDescription(c.DESCRIPTION || "");
      setLinkedinUrl(c.LINKEDIN_URL || "");
      setWebsiteUrl(c.WEBSITE_URL || "");

      // Directement depuis BQ
      setSquareUrl(c.MEDIA_LOGO_SQUARE_URL || null);
      setRectUrl(c.MEDIA_LOGO_RECT_URL || null);

      setLoading(false);
    }

    load();
  }, [id]);

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
      media_logo_square_url: squareUrl,     // 🔥 nouvelle logique : URL directe
      media_logo_rectangle_url: rectUrl,    // idem
    };

    const res = await api.put(`/company/update/${id}`, payload);

    setSaving(false);
    alert("Société mise à jour !");
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
        </h1>
        <Link href="/admin/company" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* CHAMPS TEXTE */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom"
        className="border p-2 w-full rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 w-full rounded h-24"
      />

      <input
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        placeholder="URL LinkedIn"
        className="border p-2 w-full rounded"
      />

      <input
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="Site web"
        className="border p-2 w-full rounded"
      />

      {/* VISUAL SECTION */}
      <CompanyVisualSection
        id_company={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onSquareChange={setSquareUrl}
        onRectChange={setRectUrl}
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
