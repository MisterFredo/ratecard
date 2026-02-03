"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

export default function EditCompany({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [isPartner, setIsPartner] = useState(false);

  // 🔑 LOGO — NOM DU FICHIER GCS
  const [logoFilename, setLogoFilename] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/company/${id}`);
        const c = res.company;

        setName(c.NAME || "");
        setDescription(c.DESCRIPTION || "");
        setLinkedinUrl(c.LINKEDIN_URL || "");
        setWebsiteUrl(c.WEBSITE_URL || "");
        setIsPartner(Boolean(c.IS_PARTNER));

        setLogoFilename(
          c.MEDIA_LOGO_RECTANGLE_ID || null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement société");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    setSaving(true);

    try {
      await api.put(`/company/update/${id}`, {
        name,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
        is_partner: isPartner,
      });

      alert("Société modifiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour");
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------
     URL LOGO (SOURCE DE VÉRITÉ FRONT)
  --------------------------------------------------------- */
  const rectUrl = logoFilename
    ? `${GCS_BASE_URL}/${COMPANY_MEDIA_PATH}/${logoFilename}`
    : null;

  if (loading) {
    return <p>Chargement…</p>;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
        </h1>
        <Link href="/admin/company" className="underline">
          ← Retour
        </Link>
      </div>

      <EntityBaseForm
        values={{ name, linkedinUrl, websiteUrl }}
        onChange={{
          setName,
          setLinkedinUrl,
          setWebsiteUrl,
        }}
      />

      <div className="space-y-2">
        <label className="block font-medium">
          Description
          <span className="ml-2 text-sm text-gray-500">
            (contenu éditorial – HTML)
          </span>
        </label>

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

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

      <VisualSection
        entityId={id}
        rectUrl={rectUrl}
        onUpdated={async () => {
          try {
            const res = await api.get(`/company/${id}`);
            setLogoFilename(
              res.company?.MEDIA_LOGO_RECTANGLE_ID || null
            );
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
