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

  const [NAME, setNAME] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [LINKEDIN_URL, setLINKEDIN_URL] = useState("");
  const [WEBSITE_URL, setWEBSITE_URL] = useState("");
  const [IS_PARTNER, setIS_PARTNER] = useState(false);

  const [WIKI_CONTENT, setWIKI_CONTENT] = useState("");

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

        setNAME(c.NAME || "");
        setDESCRIPTION(c.DESCRIPTION || "");
        setLINKEDIN_URL(c.LINKEDIN_URL || "");
        setWEBSITE_URL(c.WEBSITE_URL || "");
        setIS_PARTNER(Boolean(c.IS_PARTNER));

        setWIKI_CONTENT(c.WIKI_CONTENT || "");

        setLogoFilename(c.MEDIA_LOGO_RECTANGLE_ID || null);
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
        NAME,
        DESCRIPTION: DESCRIPTION || null,
        LINKEDIN_URL: LINKEDIN_URL || null,
        WEBSITE_URL: WEBSITE_URL || null,
        IS_PARTNER,
        WIKI_CONTENT: WIKI_CONTENT || null,
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

      {/* PARTNER */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={IS_PARTNER}
          onChange={(e) => setIS_PARTNER(e.target.checked)}
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
