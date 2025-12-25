// frontend/app/admin/person/create/page.tsx

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
  const [profilePic, setProfilePic] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Load companies for dropdown
  useEffect(() => {
    async function loadCompanies() {
      const res = await api.get("/company/list");
      setCompanies(res.companies || []);
      setLoadingCompanies(false);
    }
    loadCompanies();
  }, []);

  async function save() {
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

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ajouter un intervenant</h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      <input
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Fonction"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
      />

      {/* Company */}
      <div>
        <label className="font-medium">Société</label>
        <select
          className="border p-2 w-full"
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

      <input
        placeholder="Photo (URL)"
        value={profilePic}
        onChange={(e) => setProfilePic(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full"
      />

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
