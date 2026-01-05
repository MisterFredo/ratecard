"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionEvent from "@/components/visuals/VisualSectionEvent";
import EntityBaseForm from "@/components/forms/EntityBaseForm";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateEvent() {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [eventId, setEventId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  async function save() {
    if (!label.trim()) {
      alert("Label requis");
      return;
    }

    try {
      const res = await api.post("/event/create", {
        label,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      });

      if (!res.id_event) {
        alert("Erreur création event");
        return;
      }

      setEventId(res.id_event);
      alert("Event créé. Vous pouvez ajouter des visuels.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création event");
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter un événement
        </h1>
        <Link href="/admin/event" className="underline">
          ← Retour
        </Link>
      </div>

      {/* FORM BASE (label + description) */}
      <EntityBaseForm
        values={{
          name: label,
          description,
        }}
        onChange={{
          setName: setLabel,
          setDescription,
        }}
        labels={{
          name: "Nom de l’événement",
          description: "Description éditoriale",
        }}
      />

      {/* SEO */}
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            SEO title
          </label>
          <input
            className="border p-2 w-full rounded"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Titre pour Google (optionnel)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            SEO description
          </label>
          <textarea
            className="border p-2 w-full rounded h-20"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Description meta (optionnelle)"
          />
        </div>
      </div>

      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>

      {/* VISUALS — POST CREATION */}
      {eventId && (
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
      )}
    </div>
  );
}
