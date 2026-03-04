"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Angle = {
  angle_title: string;
  angle_signal: string;
  concept: string;
  concept_id: string;
};

type Props = {
  sourceType: string | null;
  sourceText: string;
  context: {
    topics: any[];
    events: any[];
    companies: any[];
  };
  onSelect: (angle: Angle) => void;
};

export default function StepAngles({
  sourceType,
  sourceText,
  context,
  onSelect,
}: Props) {
  const [angles, setAngles] = useState<Angle[]>([]);
  const [loading, setLoading] = useState(false);

  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualSignal, setManualSignal] = useState("");

  async function loadAngles() {
    if (!sourceText?.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/content/ai/angles", {
        source_type: sourceType,
        source_text: sourceText,
        context: {
          topics: context.topics.map((t) => t.id_topic), // ⚠️ IMPORTANT
          events: context.events.map((e) => e.id_event),
          companies: context.companies.map((c) => c.id_company),
        },
      });

      const received =
        res.angles ||
        res.data?.angles ||
        res.result?.angles ||
        [];

      setAngles(received);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur génération angles IA");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAngles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateManualAngle() {
    if (!manualTitle.trim() || !manualSignal.trim()) {
      alert("Titre et signal requis");
      return;
    }

    // ⚠️ En mode manuel, pas de concept_id
    // Donc on laisse vide pour l’instant (backlog compatible)
    onSelect({
      angle_title: manualTitle.trim(),
      angle_signal: manualSignal.trim(),
      concept: "",
      concept_id: "",
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Sélectionnez un angle éditorial ou créez-en un manuellement.
      </p>

      {loading && (
        <p className="text-sm text-gray-500">
          Analyse de la source en cours…
        </p>
      )}

      {!loading && angles.length > 0 && (
        <div className="space-y-3">
          {angles.map((a, idx) => (
            <div
              key={idx}
              className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(a)}
            >
              <p className="font-semibold text-ratecard-blue">
                {a.angle_title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {a.angle_signal}
              </p>

              {/* 🔥 Affichage concept */}
              <p className="text-xs text-gray-400 mt-2">
                Concept : {a.concept}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && angles.length === 0 && !manualMode && (
        <div className="text-sm text-gray-500 italic">
          Aucun angle proposé automatiquement.
        </div>
      )}

      {!manualMode && (
        <button
          onClick={() => setManualMode(true)}
          className="text-sm underline text-ratecard-blue"
        >
          Créer un angle manuellement
        </button>
      )}

      {manualMode && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <div>
            <label className="block text-sm font-medium">
              Titre de l’angle
            </label>
            <input
              className="border rounded p-2 w-full"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Signal de l’angle
            </label>
            <textarea
              className="border rounded p-2 w-full h-20"
              value={manualSignal}
              onChange={(e) => setManualSignal(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={validateManualAngle}
              className="bg-ratecard-blue text-white px-4 py-2 rounded"
            >
              Valider cet angle
            </button>

            <button
              onClick={() => setManualMode(false)}
              className="px-4 py-2 border rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
