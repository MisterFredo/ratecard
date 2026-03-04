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

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/content/${contentId}`);
        setContent(res?.content || null);
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
    return (
      <div className="text-red-500">
        Aucun contenu à afficher.
      </div>
    );
  }

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

      {/* EXCERPT */}
      {content.excerpt && (
        <div className="bg-white border rounded p-5 shadow-sm">
          <p className="text-base font-medium text-gray-800">
            {content.excerpt}
          </p>
        </div>
      )}

      {/* CONTEXTE */}
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
      </div>

      {/* CONCEPT (optionnel) */}
      {content.concept && (
        <div className="border-l-4 border-ratecard-blue pl-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Concept associé
          </h4>
          <p className="text-sm text-gray-700">
            {content.concept}
          </p>
        </div>
      )}

      {/* BODY STRUCTURÉ */}
      <div
        className="
          prose prose-sm max-w-none
          prose-p:my-4
          prose-ul:my-4
          prose-li:my-1
          prose-strong:font-semibold
        "
        dangerouslySetInnerHTML={{
          __html: content.content_body || "",
        }}
      />

      {/* CHIFFRES */}
      {content.chiffres?.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Chiffres clés
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {content.chiffres.map((c: string, i: number) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CITATIONS */}
      {content.citations?.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Citations
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {content.citations.map((c: string, i: number) => (
              <li key={i} className="italic">“{c}”</li>
            ))}
          </ul>
        </div>
      )}

      {/* ACTEURS */}
      {content.acteurs_cites?.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Acteurs cités
          </h4>
          <p className="text-sm text-gray-700">
            {content.acteurs_cites.join(", ")}
          </p>
        </div>
      )}

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
