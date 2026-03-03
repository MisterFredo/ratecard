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
  const [NAME, setNAME] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [LINKEDIN_URL, setLINKEDIN_URL] = useState("");
  const [WEBSITE_URL, setWEBSITE_URL] = useState("");
  const [IS_PARTNER, setIS_PARTNER] = useState(false);

  // --- WIKI ---
  const [WIKI_CONTENT, setWIKI_CONTENT] = useState("");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  async function save() {
    if (!NAME.trim()) {
      alert("Nom requis");
      return;
    }

    setSaving(true);

    try {
      const res = await api.post("/company/create", {
        NAME,
        DESCRIPTION: DESCRIPTION || null,
        LINKEDIN_URL: LINKEDIN_URL || null,
        WEBSITE_URL: WEBSITE_URL || null,
        IS_PARTNER,
      });

      if (!res.ID_COMPANY) {
        throw new Error("ID société manquant");
      }

      const newCompanyId = res.ID_COMPANY;
      setCompanyId(newCompanyId);

      // 🔥 Si wiki rempli → update après création
      if (WIKI_CONTENT.trim()) {
        await api.put(`/company/update/${newCompanyId}`, {
          WIKI_CONTENT,
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
      setLogoFilename(
        res.company?.MEDIA_LOGO_RECTANGLE_ID || null
      );
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
        values={{
          name: NAME,
          linkedinUrl: LINKEDIN_URL,
          websiteUrl: WEBSITE_URL,
        }}
        onChange={{
          setName: setNAME,
          setLinkedinUrl: setLINKEDIN_URL,
          setWebsiteUrl: setWEBSITE_URL,
        }}
      />

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label className="block font-medium">
          Description (commerciale)
        </label>
        <HtmlEditor value={DESCRIPTION} onChange={setDESCRIPTION} />
      </div>

      {/* WIKI */}
      <div className="border-t pt-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Wiki (connaissance interne / éditoriale)
        </h2>

        <HtmlEditor
          value={WIKI_CONTENT}
          onChange={setWIKI_CONTENT}
        />
      </div>

      {/* PARTENAIRE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={IS_PARTNER}
          onChange={(e) => setIS_PARTNER(e.target.checked)}
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
