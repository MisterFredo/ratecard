"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      const res = await api.get(`/person/${id}`);
      const p = res.person;

      setName(p.NAME);
      setJobTitle(p.TITLE);
      setDescription(p.DESCRIPTION || "");
      setCompanyId(p.ID_COMPANY || "");
      setLinkedinUrl(p.LINKEDIN_URL || "");

      if (p.MEDIA_PICTURE_SQUARE_ID)
        setSquareUrl(`${GCS}/persons/PERSON_${id}_square.jpg`);

      if (p.MEDIA_PICTURE_RECTANGLE_ID)
        setRectUrl(`${GCS}/persons/PERSON_${id}_rect.jpg`);

      setLoading(false);
    }
    load();
  }, [id]);

  async function update() {
    setSaving(true);

    await api.put(`/person/update/${id}`, {
      name,
      title: jobTitle,
      description,
      id_company: companyId || null,
      linkedin_url: linkedinUrl || null,
    });

    alert("Modifié !");
    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Modifier l’intervenant</h1>
        <Link href="/admin/person" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <input
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded h-24"
      />

      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="">—</option>
        {companies.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>

      <input
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        disabled={saving}
        onClick={update}
      >
        Enregistrer
      </button>

      <VisualSection
        entityType="person"
        entityId={id}
        squareUrl={personSquareUrl}
        rectUrl={personRectUrl}
        onUpdated={loadPerson}  // recharge après mise à jour
      />

    </div>
  );
}
