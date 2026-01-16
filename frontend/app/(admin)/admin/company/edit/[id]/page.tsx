"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditCompany({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // 🆕 PARTENAIRE
  const [isPartner, setIsPartner] = useState(false);

  // 🔑 UN SEUL VISUEL : RECTANGLE
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/company/${id}`);
        const c = res.company;

        setName(c.NAME);
        setDescription(c.DESCRIPTION || "");
        setLinkedinUrl(c.LINKEDIN_URL || "");
        setWebsiteUrl(c.WEBSITE_URL || "");

        // statut partenaire
        setIsPartner(Boolean(c.IS_PARTNER));

        // visuel rectangle uniquement
        setRectUrl(
          c.MEDIA_LOGO_RECTANGLE_ID
            ? `${GCS}/companies/COMPANY_${id}_rect.jpg`
            : null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement société");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------
  async function save() {
    setSaving(true);

    try {
      await api.put(`/company/update/${id}`, {
        name,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,

        // statut partenaire
        is_partner: isPartner,
      });

      alert("Société modifiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour");
    }

    setSaving(false);
  }

  if (loading) {
    return <p>Chargement…</p>;
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
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
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUEL — RECTANGLE ONLY */}
      <VisualSection
        entityId={id}
        rectUrl={rectUrl}
        onUpdated={({ rectangle }) => {
          setRectUrl(
            rectangle
              ? `${GCS}/companies/COMPANY_${id}_rect.jpg`
              : null
          );
        }}
      />
    </div>
  );
}
