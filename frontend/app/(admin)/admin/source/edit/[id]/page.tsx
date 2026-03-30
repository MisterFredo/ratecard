"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const SOURCE_MEDIA_PATH = "sources";

export default function EditSource() {

  const params = useParams();
  const sourceId = params?.id as string;

  const [name, setName] = useState("");
  const [typeSource, setTypeSource] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [author, setAuthor] = useState("");
  const [authorProfile, setAuthorProfile] = useState("");

  const [logoFilename, setLogoFilename] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/source/${sourceId}`);

        setName(res.name || "");
        setTypeSource(res.type_source || "");
        setDescription(res.description || "");
        setDomain(res.domain || "");
        setAuthor(res.author || "");
        setAuthorProfile(res.author_profile || "");

        setLogoFilename(res.logo || null); // ✅ NEW

      } catch (e) {
        console.error(e);
        alert("Erreur chargement source");
      } finally {
        setLoading(false);
      }
    }

    if (sourceId) {
      load();
    }
  }, [sourceId]);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------
  async function save() {

    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    try {

      setSaving(true);

      await api.put(`/source/update/${sourceId}`, {
        name,
        type_source: typeSource || null,
        description: description || null,
        domain: domain || null,
        author: author || null,
        author_profile: authorProfile || null,
      });

      alert("Source mise à jour");

    } catch (e) {

      console.error(e);
      alert("Erreur mise à jour");

    } finally {

      setSaving(false);

    }
  }

  // ---------------------------------------------------------
  // RELOAD (après upload logo)
  // ---------------------------------------------------------
  async function reloadSource() {

    try {

      const s = await api.get(`/source/${sourceId}`);

      setLogoFilename(s.logo || null);

    } catch (e) {

      console.error(e);
      alert("❌ Erreur rechargement source");

    }

  }

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  async function remove() {

    if (!confirm("Supprimer cette source ?")) {
      return;
    }

    try {

      await api.delete(`/source/${sourceId}`);

      alert("Source supprimée");

      window.location.href = "/admin/source";

    } catch (e) {

      console.error(e);
      alert("Erreur suppression");

    }
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  const logoUrl = logoFilename
    ? `${GCS_BASE_URL}/${SOURCE_MEDIA_PATH}/${logoFilename}`
    : null;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-10">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Modifier la source
        </h1>

        <Link href="/admin/source" className="underline">
          ← Retour
        </Link>

      </div>

      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Nom
        </label>

        <input
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Type de source
        </label>

        <input
          className="border p-2 w-full rounded"
          value={typeSource}
          onChange={(e) => setTypeSource(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Domaine
        </label>

        <input
          className="border p-2 w-full rounded"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Auteur
        </label>

        <input
          className="border p-2 w-full rounded"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Profil auteur
        </label>

        <input
          className="border p-2 w-full rounded"
          value={authorProfile}
          onChange={(e) => setAuthorProfile(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-w-3xl">
        <label className="block text-sm font-medium">
          Description
        </label>

        <textarea
          className="border p-2 w-full rounded h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4">

        <button
          onClick={save}
          disabled={saving}
          className="bg-ratecard-blue px-6 py-2 text-white rounded disabled:opacity-50"
        >
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>

        <button
          onClick={remove}
          className="bg-red-600 px-6 py-2 text-white rounded"
        >
          Supprimer
        </button>

      </div>

      {/* ✅ VISUAL SECTION — EXACT COMPANY */}
      <VisualSection
        entityId={sourceId}
        rectUrl={logoUrl}
        onUpdated={reloadSource}
        endpoint="source"
      />

    </div>
  );
}
