"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Les visuels seront associés APRÈS création
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return alert("Nom requis");

    setSaving(true);

    const res = await api.post("/company/create", {
      name,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      website_url: websiteUrl || null,
    });

    if (!res.id_company) {
      alert("Erreur création société");
      setSaving(false);
      return;
    }

    setCompanyId(res.id_company);
    alert("Société créée ! Ajoutez maintenant les visuels.");

    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Ajouter une société
        </h1>
        <Link href="/admin/company" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        placeholder="Site web"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
      />

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Créer"}
      </button>

      {/* VISUAL SECTION — ACTIVÉE UNIQUEMENT APRÈS CREATION */}
      {companyId && (
        <VisualSection
          entityType="company"
          entityId={companyId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(square);
            setRectUrl(rectangle);
          }}
        />
      )}
    </div>
  );
}
