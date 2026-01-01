"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import VisualSection from "@/components/visuals/VisualSection";

export default function CreatePerson() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [personId, setPersonId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await api.get("/company/list");
      setCompanies(res.companies || []);
      setLoadingCompanies(false);
    }
    load();
  }, []);

  async function save() {
    if (!name.trim()) return alert("Nom requis");

    const payload = {
      id_company: companyId || null,
      name,
      title: jobTitle || null,
      description: description || null,
      linkedin_url: linkedinUrl || null,
    };

    const res = await api.post("/person/create", payload);
    if (!res.id_person) {
      alert("Erreur création intervenant");
      return;
    }

    setPersonId(res.id_person);
    alert("Intervenant créé → Ajoutez maintenant un portrait");
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Ajouter un intervenant</h1>
        <Link href="/admin/person" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        placeholder="Nom complet"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <input
        placeholder="Fonction"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <textarea
        placeholder="Bio (optionnelle)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full rounded h-24"
      />

      {/* Société */}
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">— Aucune —</option>
        {!loadingCompanies &&
          companies.map((c) => (
            <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
              {c.NAME}
            </option>
          ))}
      </select>

      <input
        placeholder="Profil LinkedIn"
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <button
        onClick={save}
        className="bg-ratecard-blue text-white px-6 py-2 rounded"
      >
        Créer
      </button>

      {/* VISUELS — seulement après la création */}
      {personId && (
        <VisualSection
          entityType="person"
          entityId={personId}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
