"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSectionPerson from "@/components/visuals/VisualSectionPerson";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function EditPerson({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [idCompany, setIdCompany] = useState("");

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/person/${id}`);
        const p = res.person;

        setName(p.NAME);
        setTitle(p.TITLE || "");
        setDescription(p.DESCRIPTION || "");
        setLinkedinUrl(p.LINKEDIN_URL || "");
        setIdCompany(p.ID_COMPANY || "");

        setSquareUrl(
          p.MEDIA_PICTURE_SQUARE_ID
            ? `${GCS}/persons/PERSON_${id}_square.jpg`
            : null
        );
        setRectUrl(
          p.MEDIA_PICTURE_RECTANGLE_ID
            ? `${GCS}/persons/PERSON_${id}_rect.jpg`
            : null
        );
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement personne");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/person/update/${id}`, {
        name,
        title: title || null,
        description: description || null,
        linkedin_url: linkedinUrl || null,
        id_company: idCompany || null,
      });
      alert("Personne modifiée");
    } catch (e) {
      console.error(e);
      alert("❌ Erreur mise à jour personne");
    }
    setSaving(false);
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Modifier la personne</h1>
        <Link href="/admin/person" className="underline">← Retour</Link>
      </div>

      <input className="border p-2 w-full rounded" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border p-2 w-full rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="border p-2 w-full rounded h-28" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="border p-2 w-full rounded" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
      <input className="border p-2 w-full rounded" value={idCompany} onChange={(e) => setIdCompany(e.target.value)} />

      <button
        className="bg-ratecard-blue px-4 py-2 text-white rounded"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      <VisualSectionPerson
        personId={id}
        squareUrl={squareUrl}
        rectUrl={rectUrl}
        onUpdated={({ square, rectangle }) => {
          setSquareUrl(square ? `${GCS}/persons/PERSON_${id}_square.jpg` : null);
          setRectUrl(rectangle ? `${GCS}/persons/PERSON_${id}_rect.jpg` : null);
        }}
      />
    </div>
  );
}
