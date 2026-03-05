"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateSource() {

  const [SOURCE_ID, setSOURCE_ID] = useState("");
  const [NAME, setNAME] = useState("");
  const [TYPE_SOURCE, setTYPE_SOURCE] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [DOMAIN, setDOMAIN] = useState("");
  const [AUTHOR, setAUTHOR] = useState("");
  const [AUTHOR_PROFILE, setAUTHOR_PROFILE] = useState("");

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {

    if (!SOURCE_ID.trim()) {
      alert("SOURCE_ID requis");
      return;
    }

    if (!NAME.trim()) {
      alert("Nom requis");
      return;
    }

    try {

      setLoading(true);

      await api.post("/source/create", {
        SOURCE_ID,
        NAME,
        TYPE_SOURCE: TYPE_SOURCE || null,
        DESCRIPTION: DESCRIPTION || null,
        DOMAIN: DOMAIN || null,
        AUTHOR: AUTHOR || null,
        AUTHOR_PROFILE: AUTHOR_PROFILE || null,
      });

      alert("Source créée avec succès");

      // reset
      setSOURCE_ID("");
      setNAME("");
      setTYPE_SOURCE("");
      setDESCRIPTION("");
      setDOMAIN("");
      setAUTHOR("");
      setAUTHOR_PROFILE("");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur création source");

    } finally {

      setLoading(false);

    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Ajouter une source
        </h1>

        <Link href="/admin/source" className="underline">
          ← Retour
        </Link>
      </div>

      {/* SOURCE ID */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          SOURCE_ID
        </label>
        <input
          className="border p-2 w-full rounded"
          value={SOURCE_ID}
          onChange={(e) => setSOURCE_ID(e.target.value)}
          placeholder="linkedin"
        />
      </div>

      {/* NAME */}
      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Nom de la source
        </label>
        <input
          className="border p-2 w-full rounded"
          value={NAME}
          onChange={(e) => setNAME(e.target.value)}
          placeholder="LinkedIn"
        />
      </div>

      {/* TYPE */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Type de source
        </label>
        <input
          className="border p-2 w-full rounded"
          value={TYPE_SOURCE}
          onChange={(e) => setTYPE_SOURCE(e.target.value)}
          placeholder="Social / Blog / Event"
        />
      </div>

      {/* DOMAIN */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Domaine
        </label>
        <input
          className="border p-2 w-full rounded"
          value={DOMAIN}
          onChange={(e) => setDOMAIN(e.target.value)}
          placeholder="linkedin.com"
        />
      </div>

      {/* AUTHOR */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Auteur par défaut
        </label>
        <input
          className="border p-2 w-full rounded"
          value={AUTHOR}
          onChange={(e) => setAUTHOR(e.target.value)}
        />
      </div>

      {/* AUTHOR PROFILE */}
      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Profil auteur
        </label>
        <input
          className="border p-2 w-full rounded"
          value={AUTHOR_PROFILE}
          onChange={(e) => setAUTHOR_PROFILE(e.target.value)}
          placeholder="https://linkedin.com/..."
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2 max-w-3xl">
        <label className="block text-sm font-medium">
          Description
        </label>
        <textarea
          className="border p-2 w-full rounded h-24"
          value={DESCRIPTION}
          onChange={(e) => setDESCRIPTION(e.target.value)}
        />
      </div>

      {/* ACTION */}
      <button
        onClick={save}
        disabled={loading}
        className="bg-ratecard-blue px-6 py-2 text-white rounded disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer la source"}
      </button>

    </div>
  );
}
