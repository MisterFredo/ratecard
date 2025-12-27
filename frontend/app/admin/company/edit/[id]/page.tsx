"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function EditCompany({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FIELDS
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // MEDIA IDs
  const [logoRectId, setLogoRectId] = useState<string | null>(null);
  const [logoSquareId, setLogoSquareId] = useState<string | null>(null);

  // MEDIA URL PREVIEW
  const [logoRectUrl, setLogoRectUrl] = useState<string | null>(null);
  const [logoSquareUrl, setLogoSquareUrl] = useState<string | null>(null);

  const [oldLogoRectId, setOldLogoRectId] = useState<string | null>(null);
  const [oldLogoSquareId, setOldLogoSquareId] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

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

      setLogoRectId(c.MEDIA_LOGO_RECTANGLE_ID || null);
      setLogoSquareId(c.MEDIA_LOGO_SQUARE_ID || null);

      setOldLogoRectId(c.MEDIA_LOGO_RECTANGLE_ID || null);
      setOldLogoSquareId(c.MEDIA_LOGO_SQUARE_ID || null);

      // Load Media URLs
      const m = await api.get(`/media/by-entity?type=company&id=${id}`);
      const media = m.media || [];

      const rect = media.find((m) => m.FORMAT === "rectangle");
      const square = media.find((m) => m.FORMAT === "square");

      if (rect) {
        setLogoRectUrl("/media/" + rect.FILEPATH.replace("/uploads/media/", ""));
      }
      if (square) {
        setLogoSquareUrl("/media/" + square.FILEPATH.replace("/uploads/media/", ""));
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     UPDATE COMPANY
  --------------------------------------------------------- */
  async function update() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
      media_logo_rectangle_id: logoRectId,
      media_logo_square_id: logoSquareId,
    };

    const res = await api.put(`/company/update/${id}`, payload);

    // Unassign anciens si changés
    if (oldLogoRectId && oldLogoRectId !== logoRectId) {
      await api.post("/media/unassign", { media_id: oldLogoRectId });
    }
    if (oldLogoSquareId && oldLogoSquareId !== logoSquareId) {
      await api.post("/media/unassign", { media_id: oldLogoSquareId });
    }

    // Assign nouveaux
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

    setSaving(false);
    alert("Société mise à jour !");
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

      {/* LOGO SECTION */}
      <div className="space-y-3">
        <label className="font-medium">Logo (rectangle & carré)</label>

        <button
          className="bg-ratecard-green text-white px-4 py-2 rounded"
          onClick={() => setPickerOpen(true)}
        >
          Choisir un logo
        </button>

        {/* SQUARE PREVIEW */}
        {logoSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Carré :</p>
            <img
              src={logoSquareUrl}
              className="w-24 h-24 object-cover border rounded mt-1 bg-white"
            />
          </div>
        )}

        {/* RECT PREVIEW */}
        {logoRectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={logoRectUrl}
              className="w-48 h-auto border rounded mt-1 bg-white"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="all"
        onSelect={(item) => {
          if (!["logos", "logos-cropped"].includes(item.folder)) return;

          if (item.format === "square") {
            setLogoSquareId(item.media_id);
            setLogoSquareUrl(item.url);
          } else if (item.format === "rectangle") {
            setLogoRectId(item.media_id);
            setLogoRectUrl(item.url);
          }

          setPickerOpen(false);
        }}
      />

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
    </div>
  );
}





