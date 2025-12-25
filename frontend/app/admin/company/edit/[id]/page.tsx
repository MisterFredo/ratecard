// frontend/app/admin/company/edit/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EditCompany({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSquareUrl, setLogoSquareUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get(`/company/${id}`);
      const c = res.company;

      setName(c.NAME || "");
      setLogoUrl(c.LOGO_URL || "");
      setLogoSquareUrl(c.LOGO_SQUARE_URL || "");
      setLinkedinUrl(c.LINKEDIN_URL || "");
      setDescription(c.DESCRIPTION || "");

      setLoading(false);
    }
    load();
  }, [id]);

  async function update() {
    setSaving(true);

    const payload = {
      name,
      logo_url: logoUrl || null,
      logo_square_url: logoSquareUrl || null,
      linkedin_url: linkedinUrl || null,
      description: description || null,
    };

    const res = await api.put(`/company/update/${id}`, payload);
    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Modifier la société</h1>
        <Link href="/admin/company" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 w-full" />
      <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="border p-2 w-full" />
      <input value={logoSquareUrl} onChange={(e) => setLogoSquareUrl(e.target.value)} className="border p-2 w-full" />
      <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="border p-2 w-full" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 w-full h-28" />

      <button
        onClick={update}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
