"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type RawItem = {
  id_raw: string;
  source_title: string;
  date_source?: string | null;
  import_type?: string | null;
};

export default function RawDrawer({
  raw,
  onClose,
  onSaved,
}: {
  raw: RawItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!raw) return;

    setTitle(raw.source_title || "");
    setDate(raw.date_source ? raw.date_source.slice(0, 10) : "");
    setRawText("");
    setError("");

    async function loadDetail() {
      try {
        setLoadingDetail(true);
        const res = await api.get(`/content/raw/detail/${raw.id_raw}`);
        setRawText(res.raw_text || "");
      } catch (e) {
        console.error(e);
        setError("Erreur chargement détail");
      } finally {
        setLoadingDetail(false);
      }
    }

    loadDetail();
  }, [raw]);

  if (!raw) return null;

  async function handleSave() {
    try {
      setLoading(true);

      await api.put(`/content/raw/update/${raw.id_raw}`, {
        source_title: title,
        date_source: date || null,
      });

      onSaved();
      onClose();

    } catch (e) {
      console.error(e);
      setError("Erreur sauvegarde");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">

      <div className="w-[600px] bg-white h-full shadow-xl p-6 space-y-6 overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Éditer RAW
            </h2>
            <div className="text-xs text-gray-500">
              Import : {raw.import_type || "—"}
            </div>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TITLE */}
        <div className="space-y-2">
          <label className="text-sm">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* DATE */}
        <div className="space-y-2">
          <label className="text-sm">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        {/* RAW TEXT */}
        <div className="space-y-2">
          <label className="text-sm">Texte brut</label>

          {loadingDetail ? (
            <div className="text-sm text-gray-500">
              Chargement...
            </div>
          ) : (
            <textarea
              value={rawText}
              readOnly
              rows={14}
              className="w-full border rounded p-2 text-xs font-mono"
            />
          )}
        </div>

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>

      </div>

    </div>
  );
}
