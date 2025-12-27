"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function CreateAxe() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  // MEDIA GOV (DAM)
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     SAVE AXE
  --------------------------------------------------------- */
  async function save() {
    if (!label.trim()) return alert("Merci de renseigner le nom de l’axe");

    setSaving(true);

    // 1️⃣ CREATE AXE
    const payload = {
      label,
      description: description || null,
      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
    };

    const res = await api.post("/axes/create", payload);

    if (!res || !res.id_axe) {
      alert("❌ Erreur : impossible de créer l’axe.");
      setSaving(false);
      return;
    }

    const id_axe = res.id_axe;

    // 2️⃣ ASSIGN MEDIA → AXE
    async function assignIfValid(mediaId: string | null) {
      if (!mediaId) return;

      const assignRes = await api.post("/media/assign", {
        media_id: mediaId,
        entity_type: "axe",
        entity_id: id_axe,
      });

      if (assignRes.status !== "ok") {
        console.error("Erreur assign :", assignRes);
        alert("❌ Impossible d'associer un média.");
      }
    }

    await assignIfValid(mediaRectangleId);
    await assignIfValid(mediaSquareId);

    setResult(res);
    setSaving(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
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

      {/* VISUEL OFFICIEL */}
      <div className="space-y-3">
        <label className="font-medium">Visuel officiel de l’axe</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir un visuel
        </button>

        {/* RECTANGLE PREVIEW */}
        {mediaRectangleUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={mediaRectangleUrl}
              className="w-60 h-auto border rounded bg-white mt-1"
            />
          </div>
        )}

        {/* SQUARE PREVIEW */}
        {mediaSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Carré :</p>
            <img
              src={mediaSquareUrl}
              className="w-24 h-24 object-cover border rounded bg-white mt-1"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER (generics uniquement) */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="all"
        onSelect={(item) => {
          console.log("MEDIA SELECT AXE:", item);

          // 🔐 Autoriser uniquement les generics
          if (item.folder !== "generics") {
            alert("❌ Merci de choisir un visuel générique.");
            return;
          }

          if (!item.media_id) {
            alert("❌ Ce média n’a pas d’identifiant DAM (réupload requis).");
            return;
          }

          if (item.format === "rectangle") {
            setMediaRectangleId(item.media_id);
            setMediaRectangleUrl(item.url);
          } else if (item.format === "square") {
            setMediaSquareId(item.media_id);
            setMediaSquareUrl(item.url);
          }

          setPickerOpen(false);
        }}
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
