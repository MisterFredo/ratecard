"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreatePerson() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [profilePic, setProfilePic] = useState(""); // volontairement URL simple pour cette V1
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ---------------------------------------------------------
  // LOAD COMPANIES
  // ---------------------------------------------------------
  useEffect(() => {
    async function loadCompanies() {
      const res = await api.get("/company/list");
      setCompanies(res.companies || []);
      setLoadingCompanies(false);
    }
    loadCompanies();
  }, []);

  // ---------------------------------------------------------
  // SAVE PERSON
  // ---------------------------------------------------------
  async function save() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      id_company: companyId || null,
      name,
      title: title || null,
      profile_picture_url: profilePic || null,
      linkedin_url: linkedinUrl || null,
    };

    const res = await api.post("/person/create", payload);
    setResult(res);
    setSaving(false);
  }

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Ajouter un intervenant
        </h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <div>
        <label className="font-medium">Nom complet</label>
        <input
          placeholder="Ex : Marie Dupont"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* FONCTION */}
      <div>
        <label className="font-medium">Fonction</label>
        <input
          placeholder="Ex : Directrice Marketing"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SOCIÉTÉ */}
      <div>
        <label className="font-medium">Société</label>
        <select
          className="border p-2 w-full rounded mt-1"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Aucune</option>
          {!loadingCompanies &&
            companies.map((c) => (
              <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
                {c.NAME}
              </option>
            ))}
        </select>
      </div>

      {/* PHOTO - VERSION SIMPLE */}
      <div>
        <label className="font-medium">Photo (URL)</label>
        <input
          placeholder="Ex : https://…"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* LINKEDIN */}
      <div>
        <label className="font-medium">Profil LinkedIn</label>
        <input
          placeholder="Ex : https://linkedin.com/in/…"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* RESULT */}
      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
