"use client";

type SynthesisType = "CHIFFRES" | "ANALYTIQUE" | "CARTOGRAPHIE";

type Props = {
  type: SynthesisType | null;
  onSelect: (type: SynthesisType) => void;
};

export default function StepType({ type, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Choisissez le type de synthèse à produire.
        <br />
        <span className="italic">
          Ce choix conditionne les données exploitées.
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CHIFFRES */}
        <button
          onClick={() => onSelect("CHIFFRES")}
          className={`border rounded p-4 text-left ${
            type === "CHIFFRES"
              ? "border-ratecard-blue bg-blue-50"
              : "hover:border-gray-400"
          }`}
        >
          <h4 className="font-semibold text-ratecard-blue">
            Synthèse — Chiffres
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Sélection factuelle des chiffres clés issus des analyses.
          </p>
          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
            <li>3 à 5 chiffres maximum</li>
            <li>Aucune interprétation</li>
            <li>Idéal pour LinkedIn & événements</li>
          </ul>
        </button>

        {/* ANALYTIQUE */}
        <button
          onClick={() => onSelect("ANALYTIQUE")}
          className={`border rounded p-4 text-left ${
            type === "ANALYTIQUE"
              ? "border-ratecard-blue bg-blue-50"
              : "hover:border-gray-400"
          }`}
        >
          <h4 className="font-semibold text-ratecard-blue">
            Synthèse — Analytique descriptive
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Panorama des angles et des constats abordés dans les analyses.
          </p>
          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
            <li>Basée sur les angles & excerpts</li>
            <li>Forme listée ou résumé neutre</li>
            <li>Sans projection ni recommandation</li>
          </ul>
        </button>

        {/* CARTOGRAPHIE */}
        <button
          onClick={() => onSelect("CARTOGRAPHIE")}
          className={`border rounded p-4 text-left ${
            type === "CARTOGRAPHIE"
              ? "border-ratecard-blue bg-blue-50"
              : "hover:border-gray-400"
          }`}
        >
          <h4 className="font-semibold text-ratecard-blue">
            Synthèse — Cartographie
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Vue d’ensemble des sujets et acteurs couverts.
          </p>
          <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
            <li>Répartition par topics & sociétés</li>
            <li>Comptage, pas d’analyse</li>
            <li>Très utile en bilan mensuel</li>
          </ul>
        </button>
      </div>
    </div>
  );
}
