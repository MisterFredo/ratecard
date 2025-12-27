"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function EditAxe({ params }) {
  const { id } = params;

  /* -----------------------------------------
     STATE AXE
  ----------------------------------------- */
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  // IDs BQ
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  // URLs pour affichage
  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"rectangle" | "square">("rectangle");

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* -----------------------------------------
     LOAD AXE + VISUELS LIÉS
  ----------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Charger AXE
      const res = await api.get(`/axes/${id}`);
      const a = res.axe;

      setLabel(a.LABEL || "");
      setDescription(a.DESCRIPTION || "");

      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      // 2) Charger les visuels liés à cet axe
      const mediaRes = await api.get(`/media/by-entity?type=axe&id=${id}`);
      const media = mediaRes.media || [];

      const rect = media.find((m) => m.FORMAT === "rectangle");
      const square = media.find((m) => m.FORMAT === "square");

      if (rect) setMediaRectangleUrl(`/media/${rect.FILEPATH.replace("/uploads/media/", "")}`);
      if (square) setMediaSquareUrl(`/media/${square.FILEPATH.replace("/uploads/media/", "")}`);

      setLoading(false);
    }

    load();
  }, [id]);

  /* -----------------------------------------
     SAVE AXE
  ----------------------------------------- */
  async function save() {
    if (!label) return alert("Merci de renseigner un nom d’axe");

    setSaving(true);

    const payload = {
      label,
      description,
      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
      seo_title: null,
      seo_description: null,
    };

    // 1) Mise à jour AXE
    const res = await api.put(`/axes/update/${id}`, payload);

    // 2) Assign média → Axe
    if (mediaRectangleId) {
      await api.post("/media/assign", {
        media_id: mediaRectangleId,
        entity_type: "axe",
        entity_id: id,
      });
    }
    if (mediaSquareId) {
      await api.post("/media/assign", {
        media_id: mediaSquareId,
        entity_type: "axe",
        entity_id: id,
      });
    }

    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Modifier l’axe éditorial
        </h1>
        <Link href="/admin/axes" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* LABEL */}
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nom de l’axe"
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        className="border p-2 w-full rounded h-24"
      />

      {/* VISUELS */}
      <div className="space-y-3">
        <label className="font-medium">Visuels officiels de l’axe</label>

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
            Uploader un visuel
          </button>
        </div>

        {/* PREVIEW RECTANGLE */}
        {mediaRectangleUrl && (
          <div>
            <p className="text-sm text-gray-500">Visuel rectangle :</p>
            <img
              src={mediaRectangleUrl}
              className="w-60 h-auto border rounded bg-white mt-1"
            />
          </div>
        )}

        {/* PREVIEW SQUARE */}
        {mediaSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Visuel carré :</p>
            <img
              src={mediaSquareUrl}
              className="w-24 h-24 object-cover border rounded bg-white mt-1"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="generics"
        onSelect={(item) => {
          // item = { media_id, url, format }

          if (pickerMode === "rectangle") {
            setMediaRectangleId(item.media_id);
            setMediaRectangleUrl(item.url);
          } else {
            setMediaSquareId(item.media_id);
            setMediaSquareUrl(item.url);
          }

          setPickerOpen(false);
        }}
      />

      {/* UPLOADER */}
      {uploaderOpen && (
        <MediaUploader
          category="generics"
          title={label} 
          onUploadComplete={(meta) => {
            // meta.rectangle|square contient { media_id, url }
            setMediaRectangleId(meta.rectangle.media_id);
            setMediaRectangleUrl(meta.rectangle.url);

            setMediaSquareId(meta.square.media_id);
            setMediaSquareUrl(meta.square.url);

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


