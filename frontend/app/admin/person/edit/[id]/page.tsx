"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

import VisualSection from "./VisualSection";

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FIELDS
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // VISUALS (GCS URLs)
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD PERSON + VISUALS (used on init AND after visual update)
  --------------------------------------------------------- */
  async function loadPerson() {
    setLoading(true);

    // 1️⃣ Load person core
    const res = await api.get(`/person/${id}`);
    const p = res.person;

    setName(p.NAME || "");
    setJobTitle(p.TITLE || "");
    setDescription(p.DESCRIPTION || "");
    setCompanyId(p.ID_COMPANY || "");
    setLinkedinUrl(p.LINKEDIN_URL || "");

    // 2️⃣ Load visuals
    const v = await api.get(`/visuals/person/get?id=${id}`);
    if (v.status === "ok") {
      setSquareUrl(v.square_url || null);
      setRectUrl(v.rectangle_url || null);
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  useEffect(() => {
    loadPerson();
  }, [id]);

  /* ---------------------------------------------------------
     UPDATE PERSON
  --------------------------------------------------------- */
  async function update() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      name,
      title: jobTitle || null,
      description: description || null,
      id_company: companyId || null,
      linkedin_url: linkedinUrl || null,
    };

    const res = await api.put(`/person/update/${id}`, payload);

    if (res.status !== "ok") {
      alert("Erreur mise à jour");
    }

    setSaving(false);
    alert("Intervenant mis à jour !");
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’intervenant
        </h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* FORM */}
      <div className="space-y-6">

        {/* NAME */}
        <div>
          <label className="font-medium">Nom complet</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        {/* JOB TITLE */}
        <div>
          <label className="font-medium">Fonction</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded h-24 mt-1"
          />
        </div>

        {/* COMPANY */}
        <div>
          <label className="font-medium">Société</label>
          <select
            value={companyId || ""}
            onChange={(e) => setCompanyId(e.target.value)}
            className="border p-2 w-full rounded mt-1"
          >
            <option value="">Aucune</option>
            {/* ⚠️ Optionnel : charger companies ici si souhaité */}
            {/* ou créer un CompanySelector mini pour Person */}
          </select>
        </div>

        {/* LINKEDIN */}
        <div>
          <label className="font-medium">Profil LinkedIn</label>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="border p-2 w-full rounded mt-1"
          />
        </div>

        {/* ACTIONS */}
        <button
          onClick={update}
          disabled={saving}
          className="bg-ratecard-blue text-white px-6 py-2 rounded"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>

        {/* VISUALS */}
        <VisualSection
          entityType="person"
          entityId={id}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={loadPerson} // recharge propre
        />
      </div>
    </div>
  );
}
