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
    <div className="space-y-10 max-w-3xl">

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
        <p className="text-xs text-gray-500">
          Visuel principal
        </p>

        {content.rectUrl ? (
          <img
            src={content.rectUrl}
            className="w-full max-h-[260px] object-cover rounded border bg-white shadow"
          />
        ) : content.squareUrl ? (
          <img
            src={content.squareUrl}
            className="w-64 rounded border bg-white shadow"
          />
        ) : (
          <p className="text-gray-400 italic">
            Aucun visuel
          </p>
        )}
      </div>

      {/* HEADER ANALYTIQUE */}
      <div className="bg-white border rounded p-5 shadow-sm space-y-4">

        <h3 className="text-xl font-semibold text-gray-900">
          {content.ANGLE_TITLE}
        </h3>

        <p className="text-sm text-gray-600">
          {content.ANGLE_SIGNAL}
        </p>

        {content.EXCERPT && (
          <p className="text-base font-medium text-gray-800">
            {content.EXCERPT}
          </p>
        )}

        {/* META */}
        <div className="text-sm text-gray-600 space-y-1 pt-2">
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

      {/* CONCEPT */}
      {content.CONCEPT && (
        <div className="border-l-4 border-ratecard-blue pl-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Concept clé
          </h4>
          <p className="text-sm text-gray-700">
            {content.CONCEPT}
          </p>
        </div>
      )}

      {/* CONTENT BODY */}
      <div
        className="
          prose prose-sm max-w-none
          prose-p:my-4
          prose-ul:my-4
          prose-ol:my-4
          prose-li:my-1
          prose-strong:font-semibold
          prose-a:text-ratecard-blue
          prose-a:no-underline
          hover:prose-a:underline
        "
        dangerouslySetInnerHTML={{
          __html: content.CONTENT_BODY || "",
        }}
      />

      {/* ACTIONS */}
      <div className="flex gap-4 pt-6">
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

