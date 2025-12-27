"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import MediaPicker from "@/components/admin/MediaPicker";

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

  // MEDIA GOV (DAM)
  const [squareId, setSquareId] = useState<string | null>(null);
  const [rectId, setRectId] = useState<string | null>(null);

  const [oldSquareId, setOldSquareId] = useState<string | null>(null);
  const [oldRectId, setOldRectId] = useState<string | null>(null);

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

      // 1️⃣ Load companies
      const resCompanies = await api.get("/company/list");
      setCompanies(resCompanies.companies || []);

      // 2️⃣ Load person
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

      // 3️⃣ Load assigned media files
      const mediaRes = await api.get(`/media/by-entity?type=person&id=${id}`);
      const media = mediaRes.media || [];

      const square = media.find((m) => m.FORMAT === "square");
      const rect = media.find((m) => m.FORMAT === "rectangle");

      if (square)
        setSquareUrl("/media/" + square.FILEPATH.replace("/uploads/media/", ""));

      if (rect)
        setRectUrl("/media/" + rect.FILEPATH.replace("/uploads/media/", ""));

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

    // 1️⃣ UPDATE PERSON CORE FIELDS
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

    // 2️⃣ UNASSIGN OLD MEDIA (if changed)
    async function unassignIfChanged(oldId: string | null, newId: string | null) {
      if (oldId && oldId !== newId) {
        await api.post("/media/unassign", { media_id: oldId });
      }
    }

    await unassignIfChanged(oldSquareId, squareId);
    await unassignIfChanged(oldRectId, rectId);

    // 3️⃣ ASSIGN NEW MEDIA
    async function assignIfValid(mediaId: string | null) {
      if (!mediaId) return;

      const assignRes = await api.post("/media/assign", {
        media_id: mediaId,
        entity_type: "person",
        entity_id: id,
      });

      if (assignRes.status !== "ok") {
        console.error("Erreur assign media:", assignRes);
        alert("❌ Impossible d'associer le média.");
      }
    }

    await assignIfValid(squareId);
    await assignIfValid(rectId);

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
      <div>
        <label className="font-medium">Nom complet</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* JOB TITLE */}
      <div>
        <label className="font-medium">Fonction</label>
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
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

      {/* COMPANY */}
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
            <img
              src={squareUrl}
              className="w-24 h-24 object-cover border rounded mt-2 bg-white"
            />
          </div>
        )}

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
        category="all"
        onSelect={(item) => {
          console.log("MEDIA SELECTED:", item);

          // Interdiction d'utiliser autre chose que logos-cropped
          if (!["logos-cropped"].includes(item.folder)) {
            alert("❌ Merci de choisir un portrait recadré (logos-cropped).");
            return;
          }

          if (!item.media_id) {
            alert("❌ Ce média n’a pas d’identifiant DAM (réupload obligatoire).");
            return;
          }

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
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className="border p-2 w-full rounded mt-1"
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={update}
        disabled={saving}
        className="bg-ratecard-blue text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

      {result && (
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm mt-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

