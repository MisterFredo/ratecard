"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const SOURCE_MEDIA_PATH = "sources"; // ✅ à créer côté GCS

export default function CreateSource() {

  const [name, setName] = useState("");
  const [typeSource, setTypeSource] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [author, setAuthor] = useState("");
  const [authorProfile, setAuthorProfile] = useState("");

  const [sourceId, setSourceId] = useState<string | null>(null);
  const [logoFilename, setLogoFilename] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  async function save() {

    if (!name.trim()) {
      alert("Nom requis");
      return;
    }

    try {

      setLoading(true);

      const res = await api.post("/source/create", {
        name,
        type_source: typeSource || null,
        description: description || null,
        domain: domain || null,
        author: author || null,
        author_profile: authorProfile || null,
      });

      if (!res.source_id) {
        throw new Error("ID source manquant");
      }

      setSourceId(res.source_id);

      alert("Source créée. Vous pouvez maintenant ajouter un logo.");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur création source");

    } finally {

      setLoading(false);

    }
  }

  // ---------------------------------------------------------
  // RELOAD SOURCE
  // ---------------------------------------------------------
  async function reloadSource() {

    if (!sourceId) return;

    try {

      const s = await api.get(`/source/${sourceId}`);

      setLogoFilename(
        s.logo || null
      );

    } catch (e) {

      console.error(e);
      alert("❌ Erreur rechargement source");

    }

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
          Ajouter une source
        </h1>

        <Link href="/admin/source" className="underline">
          ← Retour
        </Link>
      </div>

      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Nom de la source
        </label>
        <input
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="LinkedIn"
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
          placeholder="linkedin.com"
        />
      </div>

      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Auteur par défaut
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

      <button
        onClick={save}
        disabled={loading}
        className="bg-ratecard-blue px-6 py-2 text-white rounded disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer la source"}
      </button>

      {/* VISUAL — EXACT PATTERN COMPANY */}
      {sourceId && (
        <VisualSection
          entityId={sourceId}
          rectUrl={logoUrl}
          onUpdated={reloadSource}
          endpoint="source"             // 🔥 important
        />
      )}

    </div>
  );
}
