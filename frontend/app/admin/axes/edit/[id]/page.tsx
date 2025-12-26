"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function EditAxe({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("TOPIC");
  const [label, setLabel] = useState("");

  const [visuelUrl, setVisuelUrl] = useState("");       // RECTANGULAIRE
  const [visuelSquareUrl, setVisuelSquareUrl] = useState(""); // CARRÉ

  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  // ----------------------------
  // LOAD AXE
  // ----------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get(`/axes/${id}`);
      const a = res.axe;

      setType(a.TYPE || "TOPIC");
      setLabel(a.LABEL || "");

      setVisuelUrl(a.VISUEL_URL || "");
      setVisuelSquareUrl(a.VISUEL_SQUARE_URL || "");

      setLoading(false);
    }

    load();
  }, [id]);

  // ----------------------------
  // SAVE UPDATE
  // ----------------------------
  async function update() {
    if (!label) return alert("Merci de renseigner un label");

    setSaving(true);

    const payload = {
      type,
      label,
      visuel_url: visuelUrl || null,
      visuel_square_url: visuelSquareUrl || null,
    };

    const res = await api.put(`/axes/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Modifier l’axe
        </h1>
        <Link href="/admin/axes" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* TYPE */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="TOPIC">Topic</option>
        <option value="PRODUCT">Product</option>
        <option value="COMPANY_TAG">Company Tag</option>
      </select>

      {/* LABEL */}
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
        className="border p-2 w-full rounded"
      />

      {/* VISUELS */}
      <div className="space-y-3">
        <label className="font-medium">Visuel associé (rectangle & carré)</label>

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
            Uploader un visuel
          </button>
        </div>

        {/* PREVIEW RECT */}
        {visuelUrl && (
          <div>
            <p className="text-sm text-gray-500">Visuel rectangle :</p>
            <img
              src={visuelUrl}
              className="w-60 border rounded bg-white mt-1"
            />
          </div>
        )}

        {/* PREVIEW SQUARE */}
        {visuelSquareUrl && (
          <div>
            <p className="text-sm text-gray-500">Visuel carré :</p>
            <img
              src={visuelSquareUrl}
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
        onSelect={(url) => {
          if (url.includes("square")) {
            setVisuelSquareUrl(url);
          } else {
            setVisuelUrl(url);
          }
        }}
      />

      {/* MEDIA UPLOADER */}
      {uploaderOpen && (
        <div className="border p-4 rounded bg-white">
          <MediaUploader
            category="generic"
            onUploadComplete={({ square, rectangle }) => {
              setVisuelSquareUrl(square.url);
              setVisuelUrl(rectangle.url);
              setUploaderOpen(false);
            }}
          />
        </div>
      )}

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
