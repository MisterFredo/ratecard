"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

type CompanyType = {
  id_type: string;
  label: string;
};

export default function EditCompany({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isPartner, setIsPartner] = useState(false);

  const [wikiContent, setWikiContent] = useState("");
  const [logoFilename, setLogoFilename] = useState<string | null>(null);

  const [types, setTypes] = useState<CompanyType[]>([]);

  /* ---------------------------------------------------------
     LOAD TYPES
  --------------------------------------------------------- */
  useEffect(() => {

    async function loadTypes() {

      try {

        const res = await api.get("/company/types");
        setTypes(res.types || []);

      } catch (e) {

        console.error(e);
        alert("❌ Erreur chargement types");

      }

    }

    loadTypes();

  }, []);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const c = await api.get(`/company/${id}`);

        setName(c.name || "");
        setType(c.type || "");
        setDescription(c.description || "");
        setLinkedinUrl(c.linkedin_url || "");
        setWebsiteUrl(c.website_url || "");
        setIsPartner(Boolean(c.is_partner));

        setWikiContent(c.wiki_content || "");

        setLogoFilename(c.media_logo_rectangle_id || null);

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
        type: type || null,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
        is_partner: isPartner,
        wiki_content: wikiContent || null,
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
     URL LOGO
  --------------------------------------------------------- */
  const rectUrl = logoFilename
    ? `${GCS_BASE_URL}/${COMPANY_MEDIA_PATH}/${logoFilename}`
    : null;

  if (loading) return <p>Chargement…</p>;

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
        values={{
          name,
          linkedinUrl,
          websiteUrl,
        }}
        onChange={{
          setName,
          setLinkedinUrl,
          setWebsiteUrl,
        }}
      />

      <div className="space-y-2">
        <label className="block font-medium">
          Type
        </label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md"
        >
          <option value="">— Sélectionner —</option>

          {types.map((t) => (
            <option key={t.id_type} value={t.label}>
              {t.label}
            </option>
          ))}

        </select>

      </div>

      <div className="space-y-2">
        <label className="block font-medium">
          Description (commerciale)
        </label>
        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

      <div className="border-t pt-6 space-y-2">
        <h2 className="text-lg font-semibold">
          Wiki (connaissance interne / éditoriale)
        </h2>

        <HtmlEditor
          value={wikiContent}
          onChange={setWikiContent}
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
            const c = await api.get(`/company/${id}`);
            setLogoFilename(
              c.media_logo_rectangle_id || null
            );
          } catch (e) {
            console.error(e);
          }
        }}
      />

    </div>
  );
}
