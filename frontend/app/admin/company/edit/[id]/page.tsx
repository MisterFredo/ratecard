"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditCompany({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get(`/company/${id}`);
      const c = res.company;

      setName(c.NAME);
      setDescription(c.DESCRIPTION);
      setLinkedinUrl(c.LINKEDIN_URL);
      setWebsiteUrl(c.WEBSITE_URL);

      if (c.MEDIA_LOGO_SQUARE_ID)
        setSquareUrl(`${GCS}/companies/COMPANY_${id}_square.jpg`);

      if (c.MEDIA_LOGO_RECTANGLE_ID)
        setRectUrl(`${GCS}/companies/COMPANY_${id}_rect.jpg`);

      setLoading(false);
    }

    load();
  }, [id]);

  async function save() {
    setSaving(true);

    await api.put(`/company/update/${id}`, {
      name,
      description,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
    });

    alert("Modifié !");
    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Modifier la société</h1>
        <Link href="/admin/company" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded h-28"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
      />

      <input
        className="border p-2 w-full rounded"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
      />

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        Enregistrer
      </button>

      <VisualSection
        entityType="company"
        entityId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(square);
          setRectUrl(rectangle);
        }}
      />
    </div>
  );
}
