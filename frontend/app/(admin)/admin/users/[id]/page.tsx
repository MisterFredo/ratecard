"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type Universe = {
  ID_UNIVERSE: string;
  LABEL: string;
};

export default function EditUser() {

  const params = useParams();
  const router = useRouter();

  const userId = params.id as string;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("fr");

  const [universes, setUniverses] = useState<string[]>([]);
  const [availableUniverses, setAvailableUniverses] = useState<Universe[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    async function load() {
      try {
        const [userRes, universeRes] = await Promise.all([
          api.get(`/user/${userId}`),
          api.get("/universe/list"),
        ]);

        const user = userRes.user;

        setEmail(user.EMAIL);
        setName(user.NAME || "");
        setCompany(user.COMPANY || "");
        setLanguage(user.LANGUAGE || "fr");

        setUniverses(userRes.universes || []);
        setAvailableUniverses(universeRes.universes || []);

      } catch (e) {
        console.error("❌ load error", e);
      } finally {
        setLoading(false);
      }
    }

    if (userId) load();

  }, [userId]);

  // =====================================================
  // TOGGLE UNIVERS
  // =====================================================

  function toggleUniverse(id: string) {
    setUniverses((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function save() {

    try {

      setSaving(true);

      await api.post("/user/update", {
        user_id: userId,
        name,
        company,
        language,
        universes,
      });

      alert("Utilisateur mis à jour");

      router.push("/admin/users");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur update");

    } finally {

      setSaving(false);

    }
  }

  // =====================================================
  // UI
  // =====================================================

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-10">

      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Modifier utilisateur
        </h1>

        <Link href="/admin/users" className="underline">
          ← Retour
        </Link>
      </div>

      {/* EMAIL (read only) */}
      <input
        className="border p-2 w-full rounded bg-gray-100"
        value={email}
        disabled
      />

      {/* NAME */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* COMPANY */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Société"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      {/* LANGUAGE */}
      <select
        className="border p-2 rounded w-full max-w-xs"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>

      {/* UNIVERS */}
      <div className="space-y-2">
        <label className="block font-medium">
          Univers
        </label>

        <div className="flex flex-col gap-2">
          {availableUniverses.map((u) => (
            <label key={u.ID_UNIVERSE} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={universes.includes(u.ID_UNIVERSE)}
                onChange={() => toggleUniverse(u.ID_UNIVERSE)}
              />
              {u.LABEL}
            </label>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>

    </div>
  );
}
