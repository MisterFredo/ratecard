"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";
import EntityBaseForm from "@/components/forms/EntityBaseForm";
import HtmlEditor from "@/components/admin/HtmlEditor";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

type WikiBlock = {
  title?: string;
  icon?: string;
  content?: string;
};

export default function EditCompany({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isPartner, setIsPartner] = useState(false);

  // --- WIKI ---
  const [wikiDescription, setWikiDescription] = useState("");
  const [wikiBlocks, setWikiBlocks] = useState<WikiBlock[]>([]);

  // --- LOGO ---
  const [logoFilename, setLogoFilename] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const c = await api.get(`/company/${id}`);

        setName(c.name || "");
        setDescription(c.description || "");
        setLinkedinUrl(c.linkedin_url || "");
        setWebsiteUrl(c.website_url || "");
        setIsPartner(Boolean(c.is_partner));

        setWikiDescription(c.wiki_description || "");
        setWikiBlocks(c.wiki_blocks || []);

        setLogoFilename(c.media_logo_url || null);
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

        wiki_description: wikiDescription || null,
        wiki_blocks: wikiBlocks.length > 0 ? wikiBlocks : null,
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
        values={{ name, linkedinUrl, websiteUrl }}
        onChange={{
          setName,
          setLinkedinUrl,
          setWebsiteUrl,
        }}
      />

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label className="block font-medium">
          Description
          <span className="ml-2 text-sm text-gray-500">
            (contenu éditorial – HTML)
          </span>
        </label>

        <HtmlEditor value={description} onChange={setDescription} />
      </div>

      {/* WIKI */}
      <div className="border-t pt-6 space-y-4">
        <h2 className="text-lg font-semibold">Wiki (optionnel)</h2>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description wiki"
          value={wikiDescription}
          onChange={(e) => setWikiDescription(e.target.value)}
        />

        {wikiBlocks.map((block, index) => (
          <div key={index} className="border p-3 rounded space-y-2">
            <input
              className="w-full border p-2 rounded"
              placeholder="Titre"
              value={block.title || ""}
              onChange={(e) => {
                const copy = [...wikiBlocks];
                copy[index].title = e.target.value;
                setWikiBlocks(copy);
              }}
            />

            <input
              className="w-full border p-2 rounded"
              placeholder="Icon (optionnel)"
              value={block.icon || ""}
              onChange={(e) => {
                const copy = [...wikiBlocks];
                copy[index].icon = e.target.value;
                setWikiBlocks(copy);
              }}
            />

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Contenu"
              value={block.content || ""}
              onChange={(e) => {
                const copy = [...wikiBlocks];
                copy[index].content = e.target.value;
                setWikiBlocks(copy);
              }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setWikiBlocks([...wikiBlocks, { title: "", content: "" }])
          }
          className="text-sm underline"
        >
          + Ajouter un bloc
        </button>
      </div>

      {/* PARTNER */}
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
            setLogoFilename(c.media_logo_url || null);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </div>
  );
}
