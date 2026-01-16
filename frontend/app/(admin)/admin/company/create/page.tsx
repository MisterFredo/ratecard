"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // 🆕 PARTENAIRE
  const [isPartner, setIsPartner] = useState(false);

  const [companyId, setCompanyId] = useState<string | null>(null);

  // 🔑 UN SEUL VISUEL : RECTANGLE
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // CREATE
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

        // 🆕 statut partenaire
        is_partner: isPartner,
      });

      if (!res.id_company) {
        throw new Error("ID société manquant");
      }

      setCompanyId(res.id_company);
      setRectUrl(null);

      alert(
        "Société créée. Vous pouvez maintenant ajouter un visuel rectangulaire."
      );
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

      <EntityBaseForm
        values={{ name, description, linkedinUrl, websiteUrl }}
        onChange={{
          setName,
          setDescription,
          setLinkedinUrl,
          setWebsiteUrl,
        }}
      />

      {/* PARTENAIRE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPartner}
          onChange={(e) => setIsPartner(e.target.checked)}
        />
        <label className="text-sm">
          Société partenaire
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Créer"}
      </button>

      {/* VISUEL — POST CREATION (RECTANGLE ONLY) */}
      {companyId && (
        <VisualSection
          entityId={companyId}
          rectUrl={rectUrl}
          onUpdated={({ rectangle }) => {
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

