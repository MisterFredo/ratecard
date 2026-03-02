// frontend/app/(admin)/admin/company/create/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isPartner, setIsPartner] = useState(false);

  // --- WIKI (BLOC UNIQUE OPTIONNEL) ---
  const [wikiContent, setWikiContent] = useState("");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
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
        is_partner: isPartner,
      });

      if (!res.id_company) {
        throw new Error("ID société manquant");
      }

      const newCompanyId = res.id_company;
      setCompanyId(newCompanyId);

      // 🔥 Si wiki rempli → update après création
      if (wikiContent.trim()) {
        await api.put(`/company/update/${newCompanyId}`, {
          wiki_content: wikiContent,
        });
      }

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
      setLogoFilename(res.media_logo_url || null);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur rechargement société");
    }
  }

  const rectUrl = logoFilename
    ? `${GCS_BASE_URL}/${COMPANY_MEDIA_PATH}/${logoFilename}`
    : null;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-10">
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

      {/* DESCRIPTION COMMERCIALE */}
      <div className="space-y-2">
        <label className="block font-medium">
          Description (commerciale)
        </label>
        <HtmlEditor value={description} onChange={setDescription} />
      </div>

      {/* WIKI */}
      <div className="border-t pt-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Wiki (connaissance interne / éditoriale)
        </h2>

        <HtmlEditor
          value={wikiContent}
          onChange={setWikiContent}
        />
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

      {/* VISUEL */}
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
