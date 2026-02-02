"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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
  const [content, setContent] = useState<any | null>(null);

  /* ---------------------------------------------------------
     LOAD CONTENT
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/content/${contentId}`);
        const c = res;

        if (!c) {
          throw new Error("Content vide");
        }

        setContent(c);
      } catch (e) {
        console.error(e);
        alert("Contenu introuvable");
        setContent(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [contentId]);

  if (loading) {
    return <div>Chargement de l’aperçu…</div>;
  }

  if (!content) {
    return <div className="text-red-500">Aucun contenu à afficher.</div>;
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

      {/* HEADER ANALYTIQUE */}
      <div className="bg-white border rounded p-5 shadow-sm space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {content.angle_title}
        </h3>

        <p className="text-sm text-gray-600">
          {content.angle_signal}
        </p>

        {content.excerpt && (
          <p className="text-base font-medium text-gray-800">
            {content.excerpt}
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
      {content.concept && (
        <div className="border-l-4 border-ratecard-blue pl-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Concept clé
          </h4>
          <p className="text-sm text-gray-700">
            {content.concept}
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
          __html: content.content_body || "",
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
