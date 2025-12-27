"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // MEDIA IDS (DAM)
  const [logoRectId, setLogoRectId] = useState<string | null>(null);
  const [logoSquareId, setLogoSquareId] = useState<string | null>(null);

  // PREVIEW URLS
  const [logoRectUrl, setLogoRectUrl] = useState<string | null>(null);
  const [logoSquareUrl, setLogoSquareUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     SAVE COMPANY
  --------------------------------------------------------- */
  async function save() {
    if (!name.trim()) return alert("Merci de renseigner un nom de société");

    setSaving(true);

    // 1️⃣ CREATE COMPANY
    const payload = {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
      media_logo_rectangle_id: logoRectId,
      media_logo_square_id: logoSquareId,
    };

    const res = await api.post("/company/create", payload);

    // Vérification backend
    if (!res || !res.id_company) {
      alert("❌ Erreur : impossible de créer la société.");
      setSaving(false);
      return;
    }

    const id_company = res.id_company;

    // 2️⃣ ASSIGN MEDIA → COMPANY
    async function assignIfValid(mediaId: string | null) {
      if (!mediaId) return;

      const assignRes = await api.post("/media/assign", {
        media_id: mediaId,
        entity_type: "company",
        entity_id: id_company,
      });

      if (assignRes.status !== "ok") {
        console.error("Erreur assign : ", assignRes);
        alert("❌ Impossible d'associer le média.");
      }
    }

    await assignIfValid(logoRectId);
    await assignIfValid(logoSquareId);

    setResult(res);
    setSaving(false);
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Ajouter une société
        </h1>
        <Link href="/admin/company" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NAME */}
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
        className="border p-2 w-full rounded h-28"
      />

      {/* LOGO PICKER */}
      <div className="space-y-3">
        <label className="font-semibold">Logo (rectangle & carré)</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir un logo
        </button>

        {/* SQUARE PREVIEW */}
        {logoSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Format carré :</p>
            <img src={logoSquareUrl} className="w-24 h-24 object-cover border rounded mt-1" />
          </div>
        )}

        {/* RECT PREVIEW */}
        {logoRectUrl && (
          <div>
            <p className="text-sm text-gray-500">Format rectangle :</p>
            <img src={logoRectUrl} className="w-48 h-auto border rounded mt-1" />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="all"
        onSelect={(item) => {
          console.log("MEDIA PICKED:", item);

          // 🔥 Filtrage strict : logos & logos-cropped seulement
          if (!["logos", "logos-cropped"].includes(item.folder)) {
            alert("Veuillez choisir un média de type logo.");
            return;
          }

          if (!item.media_id) {
            alert("❌ Ce média n'a pas d'identifiant DAM (réupload requis).");
            return;
          }

          if (item.format === "square") {
            setLogoSquareId(item.media_id);
            setLogoSquareUrl(item.url);
          } else if (item.format === "rectangle") {
            setLogoRectId(item.media_id);
            setLogoRectUrl(item.url);
          }
        }}
      />

      {/* LINKS */}
      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

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

      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}






