"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function CreatePerson() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // FIELDS
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // MEDIA IDs
  const [squareId, setSquareId] = useState<string | null>(null);
  const [rectId, setRectId] = useState<string | null>(null);

  // PREVIEW URLS
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"square" | "rectangle">("square");

  const [uploaderOpen, setUploaderOpen] = useState(false);

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
      title: title || null,
      description: description || null,

      media_picture_square_id: squareId,
      media_picture_rectangle_id: rectId,

      linkedin_url: linkedinUrl || null,
    };

    // 1) Create PERSON
    const res = await api.post("/person/create", payload);
    const id_person = res.id_person;

    // 2) Assign media
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

    setResult(res);
    setSaving(false);
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="font-medium">Description (optionnelle)</label>
        <textarea
          placeholder="Petite bio, rôle, responsabilité…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded h-24 mt-1"
        />
      </div>

      {/* SOCIÉTÉ */}
      <div>
        <label className="font-medium">Société (optionnel)</label>
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

      {/* PHOTO */}
      <div className="space-y-3">
        <label className="font-medium">Photos</label>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setPickerMode("square");
              setPickerOpen(true);
            }}
            className="bg-ratecard-green text-white px-4 py-2 rounded"
          >
            Portrait carré
          </button>

          <button
            onClick={() => {
              setPickerMode("rectangle");
              setPickerOpen(true);
            }}
            className="bg-ratecard-green text-white px-4 py-2 rounded"
          >
            Rectangle (optionnel)
          </button>

          <button
            onClick={() => setUploaderOpen(true)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Uploader une photo
          </button>
        </div>

        {/* SQUARE PREVIEW */}
        {squareUrl && (
          <div>
            <p className="text-sm text-gray-500">Portrait carré :</p>
            <img
              src={squareUrl}
              alt="portrait carré"
              className="w-24 h-24 object-cover border rounded mt-1"
            />
          </div>
        )}

        {/* RECT PREVIEW */}
        {rectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={rectUrl}
              alt="portrait rectangle"
              className="w-48 h-auto border rounded mt-1"
            />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        category="logos-cropped" 
        onSelect={(item) => {
          if (pickerMode === "square") {
            setSquareId(item.media_id);
            setSquareUrl(item.url);
          } else {
            setRectId(item.media_id);
            setRectUrl(item.url);
          }
        }}
      />

      {/* MEDIA UPLOADER */}
      {uploaderOpen && (
        <MediaUploader
          category="logos-cropped"
          title={name} 
          onUploadComplete={({ square, rectangle }) => {
            setSquareId(square.media_id);
            setSquareUrl(square.url);

            setRectId(rectangle.media_id);
            setRectUrl(rectangle.url);

            setUploaderOpen(false);
          }}
        />
      )}

      {/* LINKEDIN */}
      <div>
        <label className="font-medium">Profil LinkedIn</label>
        <input
          placeholder="Ex : https://linkedin.com/in/…"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* RESULT */}
      {result && (
        <pre className="bg-gray-100 p-4 rounded mt-4 whitespace-pre-wrap text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

