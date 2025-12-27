"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
// ex: https://storage.googleapis.com/ratecard-media

export default function EditPerson({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);

  // FIELDS
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // DAM MEDIA IDs
  const [squareId, setSquareId] = useState<string | null>(null);
  const [rectId, setRectId] = useState<string | null>(null);

  const [oldSquareId, setOldSquareId] = useState<string | null>(null);
  const [oldRectId, setOldRectId] = useState<string | null>(null);

  // PREVIEW URLs (GCS)
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [rectUrl, setRectUrl] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);

  const [result, setResult] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD PERSON + MEDIA
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1️⃣ companies
      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      // 2️⃣ person
      const resPerson = await api.get(`/person/${id}`);
      const p = resPerson.person;

      setName(p.NAME || "");
      setJobTitle(p.TITLE || "");
      setDescription(p.DESCRIPTION || "");
      setCompanyId(p.ID_COMPANY || "");
      setLinkedinUrl(p.LINKEDIN_URL || "");

      setSquareId(p.MEDIA_PICTURE_SQUARE_ID || null);
      setRectId(p.MEDIA_PICTURE_RECTANGLE_ID || null);

      setOldSquareId(p.MEDIA_PICTURE_SQUARE_ID || null);
      setOldRectId(p.MEDIA_PICTURE_RECTANGLE_ID || null);

      // 3️⃣ GCS media files
      const mediaRes = await api.get(`/media/by-entity?type=person&id=${id}`);
      const media = mediaRes.media || [];

      const square = media.find((m) => m.FORMAT === "square");
      const rect = media.find((m) => m.FORMAT === "rectangle");

      if (square) setSquareUrl(`${GCS_BASE_URL}/${square.FILEPATH}`);
      if (rect) setRectUrl(`${GCS_BASE_URL}/${rect.FILEPATH}`);

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

    // 1️⃣ UPDATE CORE FIELDS
    const payload = {
      id_company: companyId || null,
      name,
      title: jobTitle || null,
      description: description || null,
      linkedin_url: linkedinUrl || null,

      media_picture_square_id: squareId,
      media_picture_rectangle_id: rectId,
    };

    const res = await api.put(`/person/update/${id}`, payload);

    // 2️⃣ UNASSIGN OLD MEDIA
    async function unassign(oldId: string | null, newId: string | null) {
      if (oldId && oldId !== newId) {
        await api.post("/media/unassign", { media_id: oldId });
      }
    }

    await unassign(oldSquareId, squareId);
    await unassign(oldRectId, rectId);

    // 3️⃣ ASSIGN NEW MEDIA
    async function assign(mediaId: string | null) {
      if (!mediaId) return;

      const r = await api.post("/media/assign", {
        media_id: mediaId,
        entity_type: "person",
        entity_id: id,
      });

      if (r.status !== "ok") {
        alert("❌ Erreur assign media");
        console.error(r);
      }
    }

    await assign(squareId);
    await assign(rectId);

    setSaving(false);
    setResult(res);
  }

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     UI
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

      {/* NAME */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom complet"
        className="border p-2 w-full rounded"
      />

      {/* JOB TITLE */}
      <input
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        placeholder="Fonction"
        className="border p-2 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnelle)"
        className="border p-2 w-full rounded h-24"
      />

      {/* COMPANY */}
      <select
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="">Aucune</option>
        {companies.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>

      {/* PORTRAIT */}
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
            <p className="text-sm text-gray-500">Carré :</p>
            <img src={squareUrl} className="w-24 h-24 object-cover border rounded bg-white mt-2" />
          </div>
        )}

        {rectUrl && (
          <div>
            <p className="text-sm text-gray-500">Rectangle :</p>
            <img src={rectUrl} className="w-48 h-auto border rounded bg-white mt-2" />
          </div>
        )}
      </div>

      {/* MEDIA PICKER */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folders={["logos-cropped"]}     // portraits formatés uniquement
        onSelect={(item) => {
          if (!item.media_id) {
            alert("❌ Ce média n’a pas d’identifiant DAM.");
            return;
          }

          if (item.format === "square") {
            setSquareId(item.media_id);
            setSquareUrl(item.url);
          }

          if (item.format === "rectangle") {
            setRectId(item.media_id);
            setRectUrl(item.url);
          }

          setPickerOpen(false);
        }}
      />

      {/* LINKEDIN */}
      <input
        value={linkedinUrl}
        onChange={(e) => setLinkedinUrl(e.target.value)}
        placeholder="Profil LinkedIn"
        className="border p-2 w-full rounded mt-1"
      />

      {/* SAVE */}
      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
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


