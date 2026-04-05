"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionEvent from "@/components/visuals/VisualSectionEvent";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateEvent() {
  const [label, setLabel] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const [eventId, setEventId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     CREATE
  --------------------------------------------------------- */
  async function save() {
    if (!label.trim()) {
      alert("Nom requis");
      return;
    }

    try {
      const res = await api.post("/event/create", {
        label,
        external_url: externalUrl || null,
      });

      if (!res.id_event) {
        alert("Erreur création");
        return;
      }

      setEventId(res.id_event);

      alert("Event créé. Ajoute les visuels.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur");
    }
  }

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
      >
        Créer
      </button>

      {/* VISUALS */}
      {eventId && (
        <div className="space-y-4 border-t pt-6">

          <div className="text-sm font-medium text-gray-500">
            Visuels (GCS)
          </div>

          <VisualSectionEvent
            eventId={eventId}
            squareUrl={squareUrl}
            rectUrl={rectUrl}
            onUpdated={({ square, rectangle }) => {
              setSquareUrl(
                square
                  ? `${GCS}/events/EVENT_${eventId}_square.jpg`
                  : null
              );
              setRectUrl(
                rectangle
                  ? `${GCS}/events/EVENT_${eventId}_rect.jpg`
                  : null
              );
            }}
          />

        </div>
      )}

    </div>
  );
}
