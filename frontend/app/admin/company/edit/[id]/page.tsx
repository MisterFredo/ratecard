"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditCompany({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD COMPANY
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get(`/company/${id}`);
        const c = res.company;

        setName(c.NAME);
        setDescription(c.DESCRIPTION || "");
        setLinkedinUrl(c.LINKEDIN_URL || "");
        setWebsiteUrl(c.WEBSITE_URL || "");

        setSquareUrl(
          c.MEDIA_LOGO_SQUARE_ID
            ? `${GCS}/companies/COMPANY_${id}_square.jpg`
            : null
        );

        setRectUrl(
          c.MEDIA_LOGO_RECTANGLE_ID
            ? `${GCS}/companies/COMPANY_${id}_rect.jpg`
            : null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement société");
      }

      setLoading(false);
    }

    load();
  }, [id]);

  // ---------------------------------------------------------
  // SAVE DATA
  // ---------------------------------------------------------
  async function save() {
    setSaving(true);

    try {
      await api.put(`/company/update/${id}`, {
        name,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
      });

      alert("Société modifiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour");
    }

    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier la société
        </h1>
        <Link href="/admin/company" className="underline">
          ← Retour
        </Link>
      </div>

      {/* FORM */}
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom *
          </label>
          <input
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Google, Amazon, TF1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            className="border p-2 w-full rounded h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description éditoriale de la société"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            URL LinkedIn
          </label>
          <input
            className="border p-2 w-full rounded"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://www.linkedin.com/company/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Site web
          </label>
          <input
            className="border p-2 w-full rounded"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://www.exemple.com"
          />
        </div>
      </div>

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* VISUALS */}
      <VisualSection
        entityId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(
            square
              ? `${GCS}/companies/COMPANY_${id}_square.jpg`
              : null
          );
          setRectUrl(
            rectangle
              ? `${GCS}/companies/COMPANY_${id}_rect.jpg`
              : null
          );
        }}
      />
    </div>
  );
}

