"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionPerson from "@/components/visuals/VisualSectionPerson";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreatePerson() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [idCompany, setIdCompany] = useState("");

  const [personId, setPersonId] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    const res = await api.post("/person/create", {
      name,
      id_company: idCompany || null,
      title: title || null,
      description: description || null,
      linkedin_url: linkedinUrl || null,
    });

    if (!res.id_person) {
      alert("Erreur création personne");
      return;
    }

    setPersonId(res.id_person);
    alert("Personne créée. Vous pouvez ajouter des visuels.");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Ajouter une personne</h1>
        <Link href="/admin/person" className="underline">← Retour</Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-28"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        placeholder="ID Société (optionnel)"
        value={idCompany}
        onChange={(e) => setIdCompany(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        Créer
      </button>

      {personId && (
        <VisualSectionPerson
          personId={personId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square ? `${GCS}/persons/PERSON_${personId}_square.jpg` : null
            );
            setRectUrl(
              rectangle ? `${GCS}/persons/PERSON_${personId}_rect.jpg` : null
            );
          }}
        />
      )}
    </div>
  );
}
