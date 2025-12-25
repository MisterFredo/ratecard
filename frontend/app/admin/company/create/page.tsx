// frontend/app/admin/company/create/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateCompany() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSquareUrl, setLogoSquareUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function save() {
    setSaving(true);
    const payload = {
      name,
      logo_url: logoUrl || null,
      logo_square_url: logoSquareUrl || null,
      linkedin_url: linkedinUrl || null,
      description: description || null,
    };

    const res = await api.post("/company/create", payload);
    setResult(res);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ajouter une société</h1>
        <Link href="/admin/company" className="underline text-gray-600">
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
        placeholder="Logo (URL)"
        value={logoUrl}
        onChange={(e) => setLogoUrl(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Logo carré (URL)"
        value={logoSquareUrl}
        onChange={(e) => setLogoSquareUrl(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="URL LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full h-28"
      />

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
