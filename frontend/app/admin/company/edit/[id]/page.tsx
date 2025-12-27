"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function EditCompany({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FIELDS
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // MEDIA IDS
  const [logoRectId, setLogoRectId] = useState<string | null>(null);
  const [logoSquareId, setLogoSquareId] = useState<string | null>(null);

  // MEDIA URL PREVIEW
  const [logoRectUrl, setLogoRectUrl] = useState<string | null>(null);
  const [logoSquareUrl, setLogoSquareUrl] = useState<string | null>(null);

  // OLD MEDIA IDs → pour unassign
  const [oldLogoRectId, setOldLogoRectId] = useState<string | null>(null);
  const [oldLogoSquareId, setOldLogoSquareId] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"rectangle" | "square">("rectangle");

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD COMPANY + VISUELS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Charger la société
      const res = await api.get(`/company/${id}`);
      const c = res.company;

      setName(c.NAME || "");
      setDescription(c.DESCRIPTION || "");
      setLinkedinUrl(c.LINKEDIN_URL || "");
      setWebsiteUrl(c.WEBSITE_URL || "");

      setLogoRectId(c.MEDIA_LOGO_RECTANGLE_ID || null);
      setLogoSquareId(c.MEDIA_LOGO_SQUARE_ID || null);

      // garder OLD IDs pour unassign si changement
      setOldLogoRectId(c.MEDIA_LOGO_RECTANGLE_ID || null);
      setOldLogoSquareId(c.MEDIA_LOGO_SQUARE_ID || null);

      // 2) Charger les visuels via BQ
      const m = await api.get(`/media/by-entity?type=company&id=${id}`);
      const media = m.media || [];

      const rect = media.find((m) => m.FORMAT === "rectangle");
      const square = media.find((m) => m.FORMAT === "square");

      if (rect) {
        setLogoRectUrl(`/media/${rect.FILEPATH.replace("/uploads/media/", "")}`);
      }
      if (square) {
        setLogoSquareUrl(`/media/${square.FILEPATH.replace("/uploads/media/", "")}`);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     UPDATE COMPANY
  --------------------------------------------------------- */
  async function update() {
    if (!name) return alert("Merci de renseigner un nom");

    setSaving(true);

    // 1) Mise à jour BQ
    const payload = {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
      media_logo_rectangle_id: logoRectId,
      media_logo_square_id: logoSquareId,
    };

    const res = await api.put(`/company/update/${id}`, payload);

    // 2) Unassign anciens médias (si différents)
    if (oldLogoRectId && oldLogoRectId !== logoRectId) {
      await api.post("/media/unassign", { media_id: oldLogoRectId });
    }
    if (oldLogoSquareId && oldLogoSquareId !== logoSquareId) {
      await api.post("/media/unassign", { media_id: oldLogoSquareId });
    }

    // 3) Assign nouveaux médias
    if (logoRectId) {
      await api.post("/media/assign", {
        media_id: logoRectId,
        entity_type: "company",
        entity_id: id,
      });
    }
    if (logoSquareId) {
      await api.post("/media/assign", {
        media_id: logoSquareId,
        entity_type: "company",
        entity_id: id,
      });
    }

    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
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

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded h-28"
      />

      {/* LOGOS */}
      <div className="space-y-3">
        <label className="font-medium">Logo rectangulaire & carré</label>

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

        {/* PREVIEW RECT */}
        {logoRectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={logoRectUrl}
              className="w-48 h-auto border rounded mt-1 bg-white"
            />
          </div>
        )}

        {/* PREVIEW SQUARE */}
        {logoSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Carré :</p>
            <img
              src={logoSquareUrl}
              className="w-24 h-24 object-cover border rounded mt-1 bg-white"
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

      {/* MEDIA UPLOADER */}
      {uploaderOpen && (
        <MediaUploader
          category="logos-cropped"
          title={label} 
          onUploadComplete={({ square, rectangle }) => {
            // rectangle
            setLogoRectId(rectangle.media_id);
            setLogoRectUrl(rectangle.url);

            // square
            setLogoSquareId(square.media_id);
            setLogoSquareUrl(square.url);

            setUploaderOpen(false);
          }}
        />
      )}

      {/* LinkedIn */}
      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* Website */}
      <input
        placeholder="Site web (optionnel)"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        className="border p-2 w-full rounded"
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
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}




