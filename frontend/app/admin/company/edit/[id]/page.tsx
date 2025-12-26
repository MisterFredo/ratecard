"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function EditCompany({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");

  const [logoUrl, setLogoUrl] = useState("");         // RECTANGLE
  const [logoSquareUrl, setLogoSquareUrl] = useState(""); // CARRE

  const [pickerOpen, setPickerOpen] = useState(false);

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState<any>(null);

  // ------------------------------------------------
  // LOAD COMPANY
  // ------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get(`/company/${id}`);
      const c = res.company;

      setName(c.NAME || "");
      setLogoUrl(c.LOGO_URL || "");
      setLogoSquareUrl(c.LOGO_SQUARE_URL || "");
      setLinkedinUrl(c.LINKEDIN_URL || "");
      setDescription(c.DESCRIPTION || "");

      setLoading(false);
    }
    load();
  }, [id]);

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------
  async function update() {
    if (!name) return alert("Merci de renseigner un nom de société");

    setSaving(true);

    const payload = {
      name,
      logo_url: logoUrl || null,
      logo_square_url: logoSquareUrl || null,
      linkedin_url: linkedinUrl || null,
      description: description || null,
    };

    const res = await api.put(`/company/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
        </h1>
        <Link href="/admin/company" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* LOGOS */}
      <div className="space-y-3">
        <label className="font-medium">Logo rectangulaire & carré</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir un visuel dans la médiathèque
        </button>

        {/* PREVIEW RECTANGLE */}
        {logoUrl && (
          <div>
            <p className="text-sm text-gray-500">Logo rectangle :</p>
            <img
              src={logoUrl}
              alt="logo rectangle"
              className="w-48 h-auto border rounded bg-white p-1 mt-1"
            />
          </div>
        )}

        {/* PREVIEW CARRE */}
        {logoSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Logo carré :</p>
            <img
              src={logoSquareUrl}
              alt="logo carré"
              className="w-24 h-24 object-cover border rounded bg-white mt-1"
            />
          </div>
        )}
      </div>

      {/* DRAWER MEDIA PICKER */}
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

      {/* LINKEDIN */}
      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded h-28"
      />

      {/* SAVE */}
      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

