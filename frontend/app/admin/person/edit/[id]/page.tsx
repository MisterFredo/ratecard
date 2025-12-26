"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);

  // Champs éditables
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [result, setResult] = useState<any>(null);

  /* -----------------------------------------------------
     LOAD PERSON + COMPANIES
  ----------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      const resPerson = await api.get(`/person/${id}`);
      const p = resPerson.person;

      setName(p.NAME || "");
      setTitle(p.TITLE || "");
      setCompanyId(p.ID_COMPANY || "");
      setProfilePic(p.PROFILE_PICTURE_URL || "");
      setLinkedinUrl(p.LINKEDIN_URL || "");

      setLoading(false);
    }

    load();
  }, [id]);

  /* -----------------------------------------------------
     UPDATE
  ----------------------------------------------------- */
  async function update() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      id_company: companyId || null,
      name,
      title: title || null,
      profile_picture_url: profilePic || null,
      linkedin_url: linkedinUrl || null,
    };

    const res = await api.put(`/person/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’intervenant
        </h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <div>
        <label className="font-medium">Nom complet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* FONCTION */}
      <div>
        <label className="font-medium">Fonction</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Directeur Marketing"
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SOCIÉTÉ */}
      <div>
        <label className="font-medium">Société</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        >
          <option value="">Aucune</option>
          {companies.map((c) => (
            <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
              {c.NAME}
            </option>
          ))}
        </select>
      </div>

      {/* PHOTO (optionnelle) */}
      <div>
        <label className="font-medium">Photo (URL)</label>
        <input
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          placeholder="Ex : https://..."
          className="border p-2 w-full rounded mt-1"
        />

        {profilePic && (
          <img
            src={profilePic}
            className="w-24 h-24 object-cover border rounded bg-white mt-2 shadow-sm"
          />
        )}
      </div>

      {/* LINKEDIN */}
      <div>
        <label className="font-medium">Profil LinkedIn</label>
        <input
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="Ex : https://linkedin.com/in/…"
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE */}
      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* RESULT */}
      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

