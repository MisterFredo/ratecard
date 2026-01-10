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

  // 🔗 External URL
  const [externalUrl, setExternalUrl] = useState("");

  // 🔑 Home / Navigation
  const [homeLabel, setHomeLabel] = useState("");
  const [homeOrder, setHomeOrder] = useState<number | null>(null);
  const [isActiveHome, setIsActiveHome] = useState(false);
  const [isActiveNav, setIsActiveNav] = useState(false);

  // 🎨 Event color
  const [eventColor, setEventColor] = useState<string>("");

  const [eventId, setEventId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // CREATE (DATA ONLY)
  // ---------------------------------------------------------
  async function save() {
    if (!label.trim()) {
      alert("Nom de l’événement requis");
      return;
    }

    try {
      const res = await api.post("/event/create", {
        label,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        external_url: externalUrl || null,
      });

      if (!res.id_event) {
        alert("Erreur création event");
        return;
      }

      setEventId(res.id_event);

      await api.put(`/event/update/${res.id_event}`, {
        home_label: homeLabel || null,
        home_order: homeOrder,
        is_active_home: isActiveHome,
        is_active_nav: isActiveNav,
        event_color: eventColor || null,
        external_url: externalUrl || null,
      });

      alert(
        "Événement créé. Vous pouvez maintenant ajouter les visuels."
      );
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création événement");
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

      {/* DONNÉES DE BASE */}
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

      {/* EXTERNAL URL */}
      <div className="space-y-2 max-w-2xl">
        <label className="block text-sm font-medium mb-1">
          URL externe de l’événement
        </label>
        <input
          type="url"
          className="border p-2 w-full rounded"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://events.ratecard.fr/..."
        />
      </div>

      {/* HOME / NAV */}
      <div className="space-y-6 border-t pt-6">
        <h2 className="text-lg font-semibold">
          Affichage sur la Home et la navigation
        </h2>

        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Label Home (court)
            </label>
            <input
              className="border p-2 w-full rounded"
              value={homeLabel}
              onChange={(e) => setHomeLabel(e.target.value)}
              placeholder="Ex : Paris, Le Touquet, Miami"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ordre d’affichage sur la Home
            </label>
            <input
              type="number"
              className="border p-2 w-full rounded"
              value={homeOrder ?? ""}
              onChange={(e) =>
                setHomeOrder(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              placeholder="Ex : 1, 2, 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Couleur de l’événement
            </label>
            <input
              type="color"
              className="border p-1 w-16 h-10 rounded"
              value={eventColor}
              onChange={(e) => setEventColor(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActiveHome}
              onChange={(e) => setIsActiveHome(e.target.checked)}
            />
            Afficher sur la Home
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActiveNav}
              onChange={(e) => setIsActiveNav(e.target.checked)}
            />
            Afficher dans la navigation
          </label>
        </div>
      </div>

      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer l’événement
      </button>

      {/* VISUELS — POST CRÉATION */}
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


