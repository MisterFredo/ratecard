"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // PARTENAIRE
  const [isPartner, setIsPartner] = useState(false);

  const [companyId, setCompanyId] = useState<string | null>(null);

  // LOGO SOCIÉTÉ (URL complète, fournie par l’API)
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
        description: description || null, // HTML
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
        is_partner: isPartner,
      });

      if (!res.id_company) {
        throw new Error("ID société manquant");
      }

      setCompanyId(res.id_company);
      setRectUrl(null);

      alert("Société créée. Vous pouvez maintenant ajouter un logo.");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur création société");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // RELOAD COMPANY (post upload logo)
  // ---------------------------------------------------------
  async function reloadCompany() {
    if (!companyId) return;

    try {
      const res = await api.get(`/company/${companyId}`);
      setRectUrl(
        res.company?.MEDIA_LOGO_RECTANGLE_URL || null
      );
    } catch (e) {
      console.error(e);
      alert("❌ Erreur rechargement société");
    }
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Ajouter une société
        </h1>
        <Link href="/admin/company" className="underline">
          ← Retour
        </Link>
      </div>

      {/* INFOS DE BASE */}
      <EntityBaseForm
        values={{ name, linkedinUrl, websiteUrl }}
        onChange={{
          setName,
          setLinkedinUrl,
          setWebsiteUrl,
        }}
      />

      {/* DESCRIPTION HTML */}
      <div className="space-y-2">
        <label className="block font-medium">
          Description
          <span className="ml-2 text-sm text-gray-500">
            (contenu éditorial – HTML)
          </span>
        </label>

        <HtmlEditor value={description} onChange={setDescription} />
      </div>

      {/* PARTENAIRE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPartner}
          onChange={(e) => setIsPartner(e.target.checked)}
        />
        <label className="text-sm">Société partenaire</label>
      </div>

      {/* ACTION */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Créer"}
      </button>

      {/* VISUEL — POST CRÉATION */}
      {companyId && (
        <VisualSection
          entityId={companyId}
          rectUrl={rectUrl}
          onUpdated={reloadCompany}
        />
      )}
    </div>
  );
}

