"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

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

  // Preview URLs
  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* -----------------------------------------
     LOAD AXE + MEDIA
  ----------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/axes/${id}`);
      const a = res.axe;

      setLabel(a.LABEL || "");
      setDescription(a.DESCRIPTION || "");

      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      // load via DAM
      const m = await api.get(`/media/by-entity?type=axe&id=${id}`);
      const media = m.media || [];

      const rect = media.find((m) => m.FORMAT === "rectangle");
      const square = media.find((m) => m.FORMAT === "square");

      if (rect)
        setMediaRectangleUrl("/media/" + rect.FILEPATH.replace("/uploads/media/", ""));

      if (square)
        setMediaSquareUrl("/media/" + square.FILEPATH.replace("/uploads/media/", ""));

      setLoading(false);
    }

    load();
  }, [id]);

  /* -----------------------------------------
     SAVE
  ----------------------------------------- */
  async function save() {
    if (!label.trim()) return alert("Merci de renseigner le nom de l’axe");

    setSaving(true);

    const payload = {
      label,
      description: description || null,
      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
    };

    const res = await api.put(`/axes/update/${id}`, payload);

    // assign DAM
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
     UI
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

      {/* VISUEL */}
      <div className="space-y-3">
        <label className="font-medium">Visuel officiel de l’axe</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir un visuel
        </button>

        {/* PREVIEW RECTANGLE */}
        {mediaRectangleUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={mediaRectangleUrl}
              className="w-60 h-auto border rounded bg-white mt-1"
            />
          </div>
        )}

        {/* PREVIEW SQUARE */}
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

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folders={["generics"]}    // 🟢 Filtre DAM simple
        onSelect={(item) => {
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



