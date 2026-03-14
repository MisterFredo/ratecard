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

  useEffect(() => {
    if (!raw) return;

    setTitle(raw.source_title || "");
    setDate(raw.date_source || "");

    async function loadDetail() {
      const res = await api.get(`/content/raw/detail/${raw.id_raw}`);
      setRawText(res.raw_text || "");
    }

    loadDetail();
  }, [raw]);

  if (!raw) return null;

  async function handleSave() {
    setLoading(true);

    await api.put(`/content/raw/update/${raw.id_raw}`, {
      source_title: title,
      date_source: date || null,
    });

    setLoading(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end">

      <div className="w-[600px] bg-white h-full shadow-xl p-6 space-y-6 overflow-y-auto">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Éditer RAW</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Date</label>
          <input
            type="date"
            value={date || ""}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Texte brut</label>
          <textarea
            value={rawText}
            readOnly
            rows={12}
            className="w-full border rounded p-2 text-xs font-mono"
          />
        </div>

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
