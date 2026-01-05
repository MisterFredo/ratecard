"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  contentId: string;
  onBack: () => void;
  onNext: () => void;
};

export default function StepPreview({
  contentId,
  onBack,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD CONTENT
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get(`/content/${contentId}`);
      const c = res.content;

      const rectUrl = c.MEDIA_RECTANGLE_ID
        ? `${GCS_BASE_URL}/content/${c.MEDIA_RECTANGLE_ID}`
        : null;

      const squareUrl = c.MEDIA_SQUARE_ID
        ? `${GCS_BASE_URL}/content/${c.MEDIA_SQUARE_ID}`
        : null;

      setContent({
        ...c,
        rectUrl,
        squareUrl,
      });
    } catch (e) {
      console.error(e);
      alert("Contenu introuvable");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [contentId]);

  if (loading || !content) {
    return <div>Chargement de l’aperçu…</div>;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Aperçu du contenu
        </h2>

        <button
          onClick={onBack}
          className="underline text-gray-600"
        >
          ← Modifier
        </button>
      </div>

      {/* VISUEL */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Visuel principal</p>

        {content.rectUrl ? (
          <img
            src={content.rectUrl}
            className="w-full max-w-3xl rounded border bg-white shadow"
          />
        ) : content.squareUrl ? (
          <img
            src={content.squareUrl}
            className="w-64 rounded border bg-white shadow"
          />
        ) : (
          <p className="text-gray-400 italic">Aucun visuel</p>
        )}
      </div>

      {/* META / ANGLE */}
      <div className="bg-white border rounded p-4 space-y-3 shadow-sm max-w-3xl">
        <h3 className="text-lg font-bold">
          {content.ANGLE_TITLE}
        </h3>

        <p className="text-sm text-gray-600">
          {content.ANGLE_SIGNAL}
        </p>

        {content.EXCERPT && (
          <p className="italic text-gray-700">
            {content.EXCERPT}
          </p>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Topics :</strong>{" "}
            {content.topics?.length
              ? content.topics.map((t: any) => t.LABEL).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Événements :</strong>{" "}
            {content.events?.length
              ? content.events.map((e: any) => e.LABEL).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Sociétés :</strong>{" "}
            {content.companies?.length
              ? content.companies.map((c: any) => c.NAME).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Personnes :</strong>{" "}
            {content.persons?.length
              ? content.persons
                  .map((p: any) =>
                    `${p.NAME}${p.ROLE ? " (" + p.ROLE + ")" : ""}`
                  )
                  .join(", ")
              : "—"}
          </div>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="bg-white p-6 border rounded shadow-sm max-w-3xl space-y-4">

        {content.CONCEPT && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Concept central
            </h4>
            <p className="text-gray-800">
              {content.CONCEPT}
            </p>
          </div>
        )}

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{
            __html: content.CONTENT_BODY || "",
          }}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded"
        >
          Retour à l’édition
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-ratecard-blue text-white rounded"
        >
          Continuer vers publication
        </button>
      </div>
    </div>
  );
}
