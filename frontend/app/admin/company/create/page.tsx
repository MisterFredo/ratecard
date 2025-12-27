"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // IDs BQ + URLs pour preview
  const [logoRectId, setLogoRectId] = useState<string | null>(null);
  const [logoSquareId, setLogoSquareId] = useState<string | null>(null);

  const [logoRectUrl, setLogoRectUrl] = useState<string | null>(null);
  const [logoSquareUrl, setLogoSquareUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"rectangle" | "square">("rectangle");

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     SAVE COMPANY
  --------------------------------------------------------- */
  async function save() {
    if (!name) return alert("Merci de renseigner un nom de société");

    setSaving(true);

    // 1) Création elle-même
    const payload = {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,

      media_logo_rectangle_id: logoRectId,
      media_logo_square_id: logoSquareId,
    };

    const res = await api.post("/company/create", payload);
    const id_company = res.id_company;

    // 2) Assign des médias
    if (logoRectId) {
      await api.post("/media/assign", {
        media_id: logoRectId,
        entity_type: "company",
        entity_id: id_company,
      });
    }

    if (logoSquareId) {
      await api.post("/media/assign", {
        media_id: logoSquareId,
        entity_type: "company",
        entity_id: id_company,
      });
    }

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
        <label className="font-semibold">Logos officiels (rectangle & carré)</label>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setPickerMode("rectangle");
              setPickerOpen(true);
            }}
            className="bg-ratecard-green text-white px-4 py-2 rounded"
          >
            Choisir rectangle
          </button>

          <button
            onClick={() => {
              setPickerMode("square");
              setPickerOpen(true);
            }}
            className="bg-ratecard-green text-white px-4 py-2 rounded"
          >
            Choisir carré
          </button>

          <button
            onClick={() => setUploaderOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Uploader un logo
          </button>
        </div>

        {/* RECT PREVIEW */}
        {logoRectUrl && (
          <div>
            <p className="text-sm text-gray-500">Logo rectangle :</p>
            <img
              src={logoRectUrl}
              className="w-48 h-auto border rounded mt-1"
            />
          </div>
        )}

        {/* SQUARE PREVIEW */}
        {logoSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Logo carré :</p>
            <img
              src={logoSquareUrl}
              className="w-24 h-24 object-cover border rounded mt-1"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="logos-cropped"
        onSelect={(item) => {
          if (pickerMode === "rectangle") {
            setLogoRectId(item.media_id);
            setLogoRectUrl(item.url);
          } else {
            setLogoSquareId(item.media_id);
            setLogoSquareUrl(item.url);
          }

          setPickerOpen(false);
        }}
      />

      {/* UPLOADER */}
      {uploaderOpen && (
        <div className="border rounded p-4 bg-white">
          <MediaUploader
            category="logos-cropped"
            title={label} 
            onUploadComplete={({ square, rectangle }) => {
              // Square
              setLogoSquareId(square.media_id);
              setLogoSquareUrl(square.url);

              // Rectangle
              setLogoRectId(rectangle.media_id);
              setLogoRectUrl(rectangle.url);

              setUploaderOpen(false);
            }}
          />
        </div>
      )}

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

      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

    </div>
  );
}




