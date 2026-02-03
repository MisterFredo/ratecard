"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

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

  // 🔑 LOGO SOCIÉTÉ (URL complète, source de vérité)
  const [rectUrl, setRectUrl] = useState<string | null>(null);

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

        // ⚠️ IMPORTANT
        // On récupère DIRECTEMENT l’URL renvoyée par l’API
        // (ou null s’il n’y a pas de logo)
        setRectUrl(c.MEDIA_LOGO_RECTANGLE_URL || null);
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

  if (loading) {
    return <p>Chargement…</p>;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
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

        <HtmlEditor
          value={description}
          onChange={setDescription}
        />
      </div>

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

      {/* ACTION */}
      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUEL — LOGO SOCIÉTÉ */}
      <VisualSection
        entityId={id}
        rectUrl={rectUrl}
        onUpdated={(newUrl) => {
          setRectUrl(newUrl);
        }}
      />
    </div>
  );
}
