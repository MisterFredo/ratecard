"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Visuels (post-création uniquement)
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // CREATE COMPANY
  // ---------------------------------------------------------
  async function save() {
    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/company/create", {
        name,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
      });

      if (!res.id_company) {
        throw new Error("ID société manquant");
      }

      setCompanyId(res.id_company);
      setSquareUrl(null);
      setRectUrl(null);

      alert("Société créée. Vous pouvez maintenant ajouter des visuels.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création société");
    }

    setSaving(false);
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
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

      {/* FORM */}
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom *
          </label>
          <input
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Google, Amazon, TF1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            className="border p-2 w-full rounded h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description éditoriale de la société"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            URL LinkedIn
          </label>
          <input
            className="border p-2 w-full rounded"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/company/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Site web
          </label>
          <input
            className="border p-2 w-full rounded"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://www.exemple.com"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Créer"}
      </button>

      {/* VISUALS — POST CREATION ONLY */}
      {companyId && (
        <VisualSection
          entityId={companyId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={({ square, rectangle }) => {
            setSquareUrl(
              square
                ? `${GCS}/companies/COMPANY_${companyId}_square.jpg`
                : null
            );
            setRectUrl(
              rectangle
                ? `${GCS}/companies/COMPANY_${companyId}_rect.jpg`
                : null
            );
          }}
        />
      )}
    </div>
  );
}

