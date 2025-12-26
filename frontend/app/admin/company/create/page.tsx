"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function CreateCompany() {
  const [name, setName] = useState("");

  const [logoUrl, setLogoUrl] = useState("");          // rectangle
  const [logoSquareUrl, setLogoSquareUrl] = useState(""); // square

  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [description, setDescription] = useState("");

  async function save() {
    if (!name) return alert("Merci de renseigner un nom de société");

    setSaving(true);

    const payload = {
      name,
      logo_url: logoUrl || null,
      logo_square_url: logoSquareUrl || null,
      linkedin_url: linkedinUrl || null,
      description: description || null,
    };

    const res = await api.post("/company/create", payload);
    setResult(res);
    setSaving(false);
  }

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

      {/* NOM */}
      <input
        placeholder="Nom de la société"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* LOGOS */}
      <div className="space-y-3">
        <label className="font-semibold">Logo rectangulaire & carré</label>

        <div className="flex gap-3">
          <button
            onClick={() => setPickerOpen(true)}
            className="bg-ratecard-green text-white px-4 py-2 rounded"
          >
            Choisir dans la médiathèque
          </button>

          <button
            onClick={() => setUploaderOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Uploader un logo
          </button>
        </div>

        {/* Preview rectangle */}
        {logoUrl && (
          <div>
            <p className="text-sm text-gray-500">Logo rectangle :</p>
            <img src={logoUrl} className="w-48 h-auto border rounded mt-1" />
          </div>
        )}

        {/* Preview carré */}
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

      {/* PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="logos-cropped"
        onSelect={(url) => {
          if (url.includes("square") || url.includes("_carre")) {
            setLogoSquareUrl(url);
          } else {
            setLogoUrl(url);
          }
        }}
      />

      {/* UPLOADER */}
      {uploaderOpen && (
        <div className="border rounded p-4 bg-white">
          <MediaUploader
            category="logo-cropped"
            onUploadComplete={({ square, rectangle }) => {
              setLogoSquareUrl(square.url);   // MediaItem.url
              setLogoUrl(rectangle.url);
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

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded h-28"
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


