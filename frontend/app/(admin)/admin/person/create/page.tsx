"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionPerson from "@/components/visuals/VisualSectionPerson";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import CompanySelector, {
  Company,
} from "@/components/admin/CompanySelector";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreatePerson() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Champs spécifiques Person
  const [title, setTitle] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [personId, setPersonId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  async function save() {
    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    try {
      const res = await api.post("/person/create", {
        name,
        title: title || null,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        id_company: companies.length > 0 ? companies[0].id_company : null,
      });

      if (!res.id_person) {
        alert("Erreur création personne");
        return;
      }

      setPersonId(res.id_person);
      alert("Personne créée. Vous pouvez ajouter des visuels.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création personne");
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter une personne
        </h1>
        <Link href="/admin/person" className="underline">
          ← Retour
        </Link>
      </div>

      {/* FORM BASE */}
      <EntityBaseForm
        values={{ name, description, linkedinUrl }}
        onChange={{
          setName,
          setDescription,
          setLinkedinUrl,
        }}
        labels={{
          name: "Nom complet",
        }}
      />

      {/* TITLE */}
      <div className="max-w-2xl">
        <label className="block text-sm font-medium mb-1">
          Fonction / Titre
        </label>
        <input
          className="border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Head of Marketing, CEO, Directeur Data…"
        />
      </div>

      {/* COMPANY SELECTOR */}
      <div className="max-w-2xl">
        <CompanySelector
          values={companies}
          onChange={setCompanies}
        />
        <p className="text-xs text-gray-500 mt-1">
          Une seule société sera associée (première sélectionnée).
        </p>
      </div>

      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>

      {/* VISUALS — POST CREATION */}
      {personId && (
        <VisualSectionPerson
          personId={personId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square
                ? `${GCS}/persons/PERSON_${personId}_square.jpg`
                : null
            );
            setRectUrl(
              rectangle
                ? `${GCS}/persons/PERSON_${personId}_rect.jpg`
                : null
            );
          }}
        />
      )}
    </div>
  );
}
