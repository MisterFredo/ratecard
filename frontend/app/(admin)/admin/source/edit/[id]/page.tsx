"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EditSource() {

  const params = useParams();
  const sourceId = params?.id as string;

  const [NAME, setNAME] = useState("");
  const [TYPE_SOURCE, setTYPE_SOURCE] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [DOMAIN, setDOMAIN] = useState("");
  const [AUTHOR, setAUTHOR] = useState("");
  const [AUTHOR_PROFILE, setAUTHOR_PROFILE] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------------------------------------------------------
     LOAD SOURCE
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {

      try {

        const res = await api.get(`/source/${sourceId}`);

        setNAME(res.NAME || "");
        setTYPE_SOURCE(res.TYPE_SOURCE || "");
        setDESCRIPTION(res.DESCRIPTION || "");
        setDOMAIN(res.DOMAIN || "");
        setAUTHOR(res.AUTHOR || "");
        setAUTHOR_PROFILE(res.AUTHOR_PROFILE || "");

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

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {

    if (!NAME.trim()) {
      alert("Nom requis");
      return;
    }

    try {

      setSaving(true);

      await api.put(`/source/update/${sourceId}`, {
        NAME,
        TYPE_SOURCE: TYPE_SOURCE || null,
        DESCRIPTION: DESCRIPTION || null,
        DOMAIN: DOMAIN || null,
        AUTHOR: AUTHOR || null,
        AUTHOR_PROFILE: AUTHOR_PROFILE || null,
      });

      alert("Source mise à jour");

    } catch (e) {

      console.error(e);
      alert("Erreur mise à jour");

    } finally {

      setSaving(false);

    }
  }

  /* ---------------------------------------------------------
     DELETE
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Modifier la source
        </h1>

        <Link
          href="/admin/source"
          className="underline"
        >
          ← Retour
        </Link>

      </div>


      {/* NAME */}
      <div className="space-y-2 max-w-xl">
        <label className="block text-sm font-medium">
          Nom
        </label>

        <input
          className="border p-2 w-full rounded"
          value={NAME}
          onChange={(e) => setNAME(e.target.value)}
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
        />
      </div>


      {/* AUTHOR */}
      <div className="space-y-2 max-w-md">
        <label className="block text-sm font-medium">
          Auteur
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


      {/* ACTIONS */}
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

    </div>
  );
}
