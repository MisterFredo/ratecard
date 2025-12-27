"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function EditAxe({ params }) {
  const { id } = params;

  // FIELDS
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");

  // DAM MEDIA
  const [mediaRectangleId, setMediaRectangleId] = useState<string | null>(null);
  const [mediaSquareId, setMediaSquareId] = useState<string | null>(null);

  const [mediaRectangleUrl, setMediaRectangleUrl] = useState<string | null>(null);
  const [mediaSquareUrl, setMediaSquareUrl] = useState<string | null>(null);

  // OLD IDS (pour unassign)
  const [oldRectangleId, setOldRectangleId] = useState<string | null>(null);
  const [oldSquareId, setOldSquareId] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD AXE + MEDIA (DAM)
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/axes/${id}`);
      const a = res.axe;

      setLabel(a.LABEL || "");
      setDescription(a.DESCRIPTION || "");

      setMediaRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setMediaSquareId(a.MEDIA_SQUARE_ID || null);

      setOldRectangleId(a.MEDIA_RECTANGLE_ID || null);
      setOldSquareId(a.MEDIA_SQUARE_ID || null);

      // load DAM links
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

  /* ---------------------------------------------------------
     UPDATE AXE
  --------------------------------------------------------- */
  async function update() {
    if (!label.trim()) return alert("Merci de renseigner le nom de l’axe");

    setSaving(true);

    // 1️⃣ UPDATE AXE
    const payload = {
      label,
      description: description || null,
      media_rectangle_id: mediaRectangleId,
      media_square_id: mediaSquareId,
    };

    const res = await api.put(`/axes/update/${id}`, payload);

    // 2️⃣ UNASSIGN old media if changed
    async function unassignIfChanged(oldId: string | null, newId: string | null) {
      if (oldId && oldId !== newId) {
        await api.post("/media/unassign", { media_id: oldId });
      }
    }

    await unassignIfChanged(oldRectangleId, mediaRectangleId);
    await unassignIfChanged(oldSquareId, mediaSquareId);

    // 3️⃣ ASSIGN new media
    async function assignIfValid(mediaId: string | null) {
      if (!mediaId) return;

      const assignRes = await api.post("/media/assign", {
        media_id: mediaId,
        entity_type: "axe",
        entity_id: id,
      });

      if (assignRes.status !== "ok") {
        console.error("Erreur assign media:", assignRes);
        alert("❌ Impossible d'associer le média.");
      }
    }

    await assignIfValid(mediaRectangleId);
    await assignIfValid(mediaSquareId);

    setSaving(false);
    setResult(res);
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
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

      {/* VISUELS DAM */}
      <div className="space-y-3">
        <label className="font-medium">Visuels officiels</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir un visuel
        </button>

        {/* RECTANGLE */}
        {mediaRectangleUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={mediaRectangleUrl}
              className="w-60 h-auto border rounded bg-white mt-1"
            />
          </div>
        )}

        {/* SQUARE */}
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
        category="all"
        onSelect={(item) => {
          console.log("MEDIA SELECT AXE EDIT:", item);

          // interdire tout sauf generics
          if (item.folder !== "generics") {
            alert("❌ Merci de choisir un visuel générique (folder: generics)");
            return;
          }

          if (!item.media_id) {
            alert("❌ Ce média n’a pas d’identifiant DAM (réupload nécessaire)");
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




