"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type SynthesisModel = {
  id_model: string;
  name: string;
  topic_ids?: string[];
  company_ids?: string[];
};

type Props = {
  model: SynthesisModel | null;
  onSelect: (model: SynthesisModel) => void;
};

export default function StepModel({ model, onSelect }: Props) {
  const [models, setModels] = useState<SynthesisModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadModels() {
      setLoading(true);
      try {
        const res = await api.get("/synthesis/models");

        // 🔑 lecture robuste du wrapper api
        const list =
          res.models ??
          res.data?.models ??
          [];

        console.log("SYNTHESIS MODELS", list);

        setModels(list);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement modèles de synthèse");
      }
      setLoading(false);
    }

    loadModels();
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Sélectionnez le modèle de synthèse.
        <br />
        <span className="italic">
          Un modèle définit le périmètre observé (topics / sociétés).
        </span>
      </p>

      {loading && (
        <p className="text-sm text-gray-400 italic">
          Chargement des modèles…
        </p>
      )}

      {!loading && models.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          Aucun modèle de synthèse disponible.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <button
            key={m.id_model}
            onClick={() => onSelect(m)}
            className={`border rounded p-4 text-left ${
              model?.id_model === m.id_model
                ? "border-ratecard-blue bg-blue-50"
                : "hover:border-gray-400"
            }`}
          >
            <h4 className="font-semibold text-ratecard-blue">
              {m.name}
            </h4>

            <div className="text-xs text-gray-600 mt-2 space-y-1">
              {m.topic_ids && m.topic_ids.length > 0 && (
                <p>
                  <strong>Topics :</strong>{" "}
                  {m.topic_ids.length}
                </p>
              )}

              {m.company_ids && m.company_ids.length > 0 && (
                <p>
                  <strong>Sociétés :</strong>{" "}
                  {m.company_ids.length}
                </p>
              )}

              {!m.topic_ids?.length && !m.company_ids?.length && (
                <p className="italic text-gray-400">
                  Périmètre non renseigné
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
