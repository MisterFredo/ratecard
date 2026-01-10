"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionEvent from "@/components/visuals/VisualSectionEvent";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditEvent({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // 🔗 External URL
  const [externalUrl, setExternalUrl] = useState("");

  // 🔑 Home / Nav
  const [homeLabel, setHomeLabel] = useState("");
  const [homeOrder, setHomeOrder] = useState<number | null>(null);
  const [isActiveHome, setIsActiveHome] = useState(false);
  const [isActiveNav, setIsActiveNav] = useState(false);

  // 🎨 Event color
  const [eventColor, setEventColor] = useState<string>("");

  // 🧭 CONTEXTE ÉVÉNEMENTIEL
  const [contextHtml, setContextHtml] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/event/${id}`);
        const e = res.event;

        setLabel(e.LABEL);
        setDescription(e.DESCRIPTION || "");
        setSeoTitle(e.SEO_TITLE || "");
        setSeoDescription(e.SEO_DESCRIPTION || "");

        setExternalUrl(e.EXTERNAL_URL || "");

        setHomeLabel(e.HOME_LABEL || "");
        setHomeOrder(
          e.HOME_ORDER !== undefined && e.HOME_ORDER !== null
            ? Number(e.HOME_ORDER)
            : null
        );
        setIsActiveHome(!!e.IS_ACTIVE_HOME);
        setIsActiveNav(!!e.IS_ACTIVE_NAV);

        setEventColor(e.EVENT_COLOR || "");

        // 🧭 CONTEXTE
        setContextHtml(e.CONTEXT_HTML || "");

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
        alert("❌ Erreur chargement événement");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------
  async function save() {
    setSaving(true);

    try {
      await api.put(`/event/update/${id}`, {
        label,
        description: description || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,

        external_url: externalUrl || null,

        home_label: homeLabel || null,
        home_order: homeOrder,
        is_active_home: isActiveHome,
        is_active_nav: isActiveNav,

        event_color: eventColor || null,

        // 🧭 CONTEXTE ÉVÉNEMENTIEL
        context_html: contextHtml || null,
      });

      alert("Événement modifié");
    } catch (err) {
      console.error(err);
      alert("❌ Erreur mise à jour événement");
    }

    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Modifier l’événement
        </h1>
        <Link href="/admin/event" className="underline">
          ← Retour
        </Link>
      </div>

      {/* ===================== BASE ===================== */}
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

      {/* ===================== SEO ===================== */}
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

      {/* ===================== URL ===================== */}
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

      {/* ===================== CONTEXTE ÉVÉNEMENTIEL ===================== */}
      <div className="space-y-3 max-w-3xl border-t pt-6">
        <h2 className="text-lg font-semibold">
          Contexte événementiel (Home)
        </h2>

        <p className="text-sm text-gray-500">
          Texte court lié à l’événement (avant / pendant / après).
          <br />
          Pas d’analyse marché, pas de reprise des analyses Ratecard.
        </p>

        <HtmlEditor
          value={contextHtml}
          onChange={setContextHtml}
        />
      </div>

      {/* ===================== HOME / NAV ===================== */}
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

      {/* ===================== ACTIONS ===================== */}
      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* ===================== VISUELS ===================== */}
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
  );
}
