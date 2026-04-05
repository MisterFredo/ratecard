"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionEvent from "@/components/visuals/VisualSectionEvent";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditEvent({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/event/${id}`);
        const e = res.event;

        setLabel(e.LABEL || "");
        setExternalUrl(e.EXTERNAL_URL || "");

        setSquareUrl(
          e.MEDIA_SQUARE_ID
            ? `${GCS}/events/EVENT_${id}_square.jpg`
            : null
        );

        setRectUrl(
          e.MEDIA_RECTANGLE_ID
            ? `${GCS}/events/EVENT_${id}_rect.jpg`
            : null
        );
      } catch (err) {
        console.error(err);
        alert("❌ Erreur chargement");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);

    try {
      await api.put(`/event/update/${id}`, {
        label,
        external_url: externalUrl || null,
      });

      alert("Enregistré");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur");
    }

    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8 max-w-2xl">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Event (assets)
        </h1>
        <Link href="/admin/event" className="underline">
          ← Retour
        </Link>
      </div>

      {/* BASIC */}
      <div className="space-y-4">

        <div>
          <label className="text-sm font-medium">
            Nom
          </label>
          <input
            className="border p-2 w-full rounded"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            URL (clic hero)
          </label>
          <input
            className="border p-2 w-full rounded"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

      </div>

      {/* ACTION */}
      <button
        onClick={save}
        className="bg-black text-white px-4 py-2 rounded"
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS */}
      <div className="space-y-4 border-t pt-6">

        <div className="text-sm font-medium text-gray-500">
          Visuels (GCS)
        </div>

        <VisualSectionEvent
          eventId={id}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square
                ? `${GCS}/events/EVENT_${id}_square.jpg`
                : null
            );
            setRectUrl(
              rectangle
                ? `${GCS}/events/EVENT_${id}_rect.jpg`
                : null
            );
          }}
        />

      </div>

    </div>
  );
}
