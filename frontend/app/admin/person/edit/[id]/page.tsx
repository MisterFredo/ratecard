// frontend/app/admin/person/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);
  const [person, setPerson] = useState<any>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [result, setResult] = useState<any>(null);

  // Load companies & person details
  useEffect(() => {
    async function load() {
      setLoading(true);

      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      const resPerson = await api.get(`/person/${id}`);
      const p = resPerson.person;
      setPerson(p);

      setName(p.NAME || "");
      setTitle(p.TITLE || "");
      setCompanyId(p.ID_COMPANY || "");
      setProfilePic(p.PROFILE_PICTURE_URL || "");
      setLinkedinUrl(p.LINKEDIN_URL || "");

      setLoading(false);
    }

    load();
  }, [id]);

  async function update() {
    setSaving(true);

    const payload = {
      id_company: companyId,
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

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Modifier l'intervenant</h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 w-full" />

      {/* Company */}
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">Aucune</option>
        {companies.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>

      <input
        value={profilePic}
        onChange={(e) => setProfilePic(e.target.value)}
        placeholder="Photo (URL)"
        className="border p-2 w-full"
      />

      <input
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        placeholder="URL LinkedIn"
        className="border p-2 w-full"
      />

      <button
        onClick={update}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
