"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function CreateAxe() {
  /* -----------------------------------------
     STATE — modèle final
  ----------------------------------------- */
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  // IDs BQ des médias
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  // URLs pour preview (frontend only)
  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"rectangle" | "square">("rectangle");

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* -----------------------------------------
     SAVE AXE
  ----------------------------------------- */
  async function save() {
    if (!label) return alert("Merci de renseigner le label");

    setSaving(true);

    // 1) Création AXE
    const axeRes = await api.post("/axes/create", {
      label,
      description,
      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
      seo_title: null,
      seo_description: null,
    });

    const id_axe = axeRes.id_axe;
    setResult(axeRes);

    // 2) Assign média → Axe
    if (mediaRectangleId) {
      await api.post("/media/assign", {
        media_id: mediaRectangleId,
        entity_type: "axe",
        entity_id: id_axe,
      });
    }

    if (mediaSquareId) {
      await api.post("/media/assign", {
        media_id: mediaSquareId,
        entity_type: "axe",
        entity_id: id_axe,
      });
    }

    setSaving(false);
  }

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Ajouter un axe éditorial
        </h1>
        <Link href="/admin/axes" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* LABEL */}
      <input
        placeholder="Nom de l’axe éditorial"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
        /* 🔥 NOUVEAU : onSelect renvoie { media_id, url, format } */
        onSelect={(item) => {
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

      {/* MEDIA UPLOADER */}
      {uploaderOpen && (
        <MediaUploader
          category="generics"
          /* 🔥 NOUVEAU : uploader renvoie media_id déjà indexé BQ */
          onUploadComplete={(meta) => {
            // meta = { original, rectangle, square } avec media_id
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



