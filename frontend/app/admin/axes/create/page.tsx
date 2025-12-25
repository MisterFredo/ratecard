// frontend/app/admin/axes/create/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateAxe() {
  const [type, setType] = useState("TOPIC");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  async function save() {
    setSaving(true);
    const res = await api.post("/axes/create", { type, label });
    setResult(res);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ajouter un axe</h1>
        <Link href="/admin/axes" className="underline text-gray-600">← Retour</Link>
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="TOPIC">Topic</option>
        <option value="PRODUCT">Product</option>
        <option value="COMPANY_TAG">Company Tag</option>
      </select>

      <input
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
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
        <pre className="bg-gray-100 p-4 rounded mt-4">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
