"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";
import MediaUploader from "@/components/admin/MediaUploader";

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);

  // FIELDS
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // MEDIA IDS (new)
  const [squareId, setSquareId] = useState<string | null>(null);
  const [rectId, setRectId] = useState<string | null>(null);

  // OLD MEDIA IDS (for unassign)
  const [oldSquareId, setOldSquareId] = useState<string | null>(null);
  const [oldRectId, setOldRectId] = useState<string | null>(null);

  // PREVIEW URLS
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"square" | "rectangle">("square");

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD COMPANIES + PERSON + MEDIA
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) companies
      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      // 2) person
      const resPerson = await api.get(`/person/${id}`);
      const p = resPerson.person;

      setName(p.NAME || "");
      setTitle(p.TITLE || "");
      setDescription(p.DESCRIPTION || "");
      setCompanyId(p.ID_COMPANY || "");
      setLinkedinUrl(p.LINKEDIN_URL || "");

      setSquareId(p.MEDIA_PICTURE_SQUARE_ID || null);
      setRectId(p.MEDIA_PICTURE_RECTANGLE_ID || null);

      setOldSquareId(p.MEDIA_PICTURE_SQUARE_ID || null);
      setOldRectId(p.MEDIA_PICTURE_RECTANGLE_ID || null);

      // 3) media files
      const mediaRes = await api.get(`/media/by-entity?type=person&id=${id}`);
      const media = mediaRes.media || [];

      const rect = media.find((m) => m.FORMAT === "rectangle");
      const square = media.find((m) => m.FORMAT === "square");

      if (square) {
        setSquareUrl(`/media/${square.FILEPATH.replace("/uploads/media/", "")}`);
      }
      if (rect) {
        setRectUrl(`/media/${rect.FILEPATH.replace("/uploads/media/", "")}`);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  /* ---------------------------------------------------------
     UPDATE PERSON
  --------------------------------------------------------- */
  async function update() {
    if (!name.trim()) return alert("Merci de renseigner un nom");

    setSaving(true);

    const payload = {
      id_company: companyId || null,
      name,
      title: title || null,
      description: description || null,
      linkedin_url: linkedinUrl || null,
      media_picture_square_id: squareId,
      media_picture_rectangle_id: rectId,
    };

    // UPDATE BQ
    const res = await api.put(`/person/update/${id}`, payload);

    // UNASSIGN OLD IF CHANGED
    if (oldSquareId && oldSquareId !== squareId) {
      await api.post("/media/unassign", { media_id: oldSquareId });
    }
    if (oldRectId && oldRectId !== rectId) {
      await api.post("/media/unassign", { media_id: oldRectId });
    }

    // ASSIGN NEW
    if (squareId) {
      await api.post("/media/assign", {
        media_id: squareId,
        entity_type: "person",
        entity_id: id,
      });
    }
    if (rectId) {
      await api.post("/media/assign", {
        media_id: rectId,
        entity_type: "person",
        entity_id: id,
      });
    }

    setResult(res);
    setSaving(false);
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Modifier l’intervenant
        </h1>
        <Link href="/admin/person" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* NOM */}
      <div>
        <label className="font-medium">Nom complet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* FONCTION */}
      <div>
        <label className="font-medium">Fonction</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded h-24 mt-1"
        />
      </div>

      {/* SOCIÉTÉ */}
      <div>
        <label className="font-medium">Société</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        >
          <option value="">Aucune</option>
          {companies.map((c) => (
            <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
              {c.NAME}
            </option>
          ))}
        </select>
      </div>

      {/* PHOTOS */}
      <div className="space-y-3">
        <label className="font-medium">Portraits</label>

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

        {/* PREVIEW SQUARE */}
        {squareUrl && (
          <div>
            <p className="text-sm text-gray-500">Portrait carré :</p>
            <img
              src={squareUrl}
              className="w-24 h-24 object-cover border rounded mt-2 bg-white"
            />
          </div>
        )}

        {/* PREVIEW RECTANGLE */}
        {rectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img
              src={rectUrl}
              className="w-48 h-auto border rounded mt-2 bg-white"
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
          setPickerOpen(false);
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
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE */}
      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {/* RESULT */}
      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}


