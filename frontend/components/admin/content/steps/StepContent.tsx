"use client";

import ContentContentBlock from "@/components/admin/content/ContentContentBlock";
import { api } from "@/lib/api";

type Props = {
  angle: {
    angle_title: string;
    angle_signal: string;
  };
  excerpt: string;
  concept: string;
  contentBody: string;
  onChange: (data: {
    excerpt?: string;
    concept?: string;
    contentBody?: string;
  }) => void;
  onValidate: () => void;
};

export default function StepContent({
  angle,
  excerpt,
  concept,
  contentBody,
  onChange,
  onValidate,
}: Props) {
  async function generateViaIA() {
    try {
      const res = await api.post("/content/ai/generate", {
        angle_title: angle.angle_title,
        angle_signal: angle.angle_signal,
        // source + context sont déjà connus côté Studio
      });

      if (res.content) {
        onChange({
          excerpt: res.content.excerpt,
          concept: res.content.concept,
          contentBody: res.content.content_body,
        });
      }
    } catch (e) {
      console.error(e);
      alert("❌ Erreur génération IA");
    }
  }

  return (
    <div className="space-y-6">
      {/* ANGLE CONTEXT */}
      <div className="border rounded p-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">
          Angle sélectionné
        </p>
        <p className="font-semibold text-ratecard-blue">
          {angle.angle_title}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {angle.angle_signal}
        </p>
      </div>

      {/* CONTENT FORM */}
      <ContentContentBlock
        excerpt={excerpt}
        concept={concept}
        contentBody={contentBody}
        onChange={onChange}
      />

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={generateViaIA}
          className="border border-ratecard-blue text-ratecard-blue px-4 py-2 rounded"
        >
          Générer via IA
        </button>

        <button
          onClick={onValidate}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Valider le contenu
        </button>
      </div>
    </div>
  );
}
