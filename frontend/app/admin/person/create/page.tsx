"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

export default function CreatePerson() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // FIELDS
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // MEDIA GOV (DAM)
  const [squareId, setSquareId] = useState<string | null>(null);
  const [rectId, setRectId] = useState<string | null>(null);

  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD COMPANIES
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadCompanies() {
      const res = await api.get("/company/list");
      setCompanies(res.companies || []);
      setLoadingCompanies(false);
    }
    loadCompanies();
  }, []);

  /* ---------------------------------------------------------
     SAVE PERSON
  --------------------------------------------------------- */
  async function save() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      id_company: companyId || null,
      name,
      title: jobTitle || null,
      description: description || null,

      media_picture_square_id: squareId,
      media_picture_rectangle_id: rectId,

      linkedin_url: linkedinUrl || null,
    };

    const res = await api.post("/person/create", payload);
    const id_person = res.id_person;

    // assign DAM
    if (squareId) {
      await api.post("/media/assign", {
        media_id: squareId,
        entity_type: "person",
        entity_id: id_person,
      });
    }

    if (rectId) {
      await api.post("/media/assign", {
        media_id: rectId,
        entity_type: "person",
        entity_id: id_person,
      });
    }

    setSaving(false);
    setResult(res);
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Ajouter un intervenant
        </h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <div>
        <label className="font-medium">Nom complet</label>
        <input
          placeholder="Ex : Marie Dupont"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* FONCTION */}
      <div>
        <label className="font-medium">Fonction</label>
        <input
          placeholder="Ex : Directrice Marketing"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="font-medium">Description (optionnelle)</label>
        <textarea
          placeholder="Bio courte…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded h-24 mt-1"
        />
      </div>

      {/* SOCIÉTÉ */}
      <div>
        <label className="font-medium">Société (optionnelle)</label>
        <select
          className="border p-2 w-full rounded mt-1"
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

      {/* PHOTO (DAM) */}
      <div className="space-y-3">
        <label className="font-medium">Photo officielle</label>

        <button
          onClick={() => setPickerOpen(true)}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          Choisir une photo
        </button>

        {/* PREVIEWS */}
        {squareUrl && (
          <div>
            <p className="text-sm text-gray-500">Portrait carré :</p>
            <img
              src={squareUrl}
              className="w-24 h-24 object-cover border rounded mt-1"
            />
          </div>
        )}

        {rectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={rectUrl}
              className="w-48 h-auto border rounded mt-1"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folders={["logos-cropped"]}  // 🟢 Governing folder for portraits
        onSelect={(item) => {
          if (item.format === "square") {
            setSquareId(item.media_id);
            setSquareUrl(item.url);
          } else if (item.format === "rectangle") {
            setRectId(item.media_id);
            setRectUrl(item.url);
          }
          setPickerOpen(false);
        }}
      />

      {/* LINKEDIN */}
      <div>
        <label className="font-medium">Profil LinkedIn</label>
        <input
          placeholder="https://linkedin.com/in/…"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded mt-3"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}


