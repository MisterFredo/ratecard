"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Angle = {
  angle_title: string;
  angle_signal: string;
};

type Props = {
  sourceType: string | null;
  sourceText: string;
  context: {
    topics: any[];
    events: any[];
    companies: any[];
    persons: any[];
  };
  onSelect: (angle: Angle) => void;
};

export default function StepAngles({
  sourceType,
  sourceText,
  context,
  onSelect,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [angles, setAngles] = useState<Angle[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD ANGLES
  // ---------------------------------------------------------
  useEffect(() => {
    if (!sourceText) return;

    async function loadAngles() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.post("/content/ai/angles", {
          source_type: sourceType,
          source_text: sourceText,
          context: {
            topics: context.topics.map((t) => t.label),
            events: context.events.map((e) => e.label),
            companies: context.companies.map((c) => c.name),
            persons: context.persons.map((p) => p.name),
          },
        });

        setAngles(res.angles || []);
      } catch (e) {
        console.error(e);
        setError("❌ Erreur génération angles");
      }

      setLoading(false);
    }

    loadAngles();
  }, [sourceType, sourceText]);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (loading) {
    return <p className="text-gray-500">Analyse de la source…</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!angles.length) {
    return (
      <p className="italic text-gray-500">
        Aucun angle pertinent n’a été détecté.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Sélectionnez l’angle stratégique à développer :
      </p>

      <div className="space-y-3">
        {angles.map((a, idx) => (
          <div
            key={idx}
            className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(a)}
          >
            <h3 className="font-semibold text-ratecard-blue">
              {a.angle_title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {a.angle_signal}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
