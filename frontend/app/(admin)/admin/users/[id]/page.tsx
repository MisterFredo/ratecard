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
  const [role, setRole] = useState("user");

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

        const user = userRes?.user;

        if (!user) {
          throw new Error("User not found");
        }

        // USER
        setEmail(user.EMAIL || "");
        setName(user.NAME || "");
        setCompany(user.COMPANY || "");
        setLanguage(user.LANGUAGE || "fr");
        setRole(user.ROLE || "user");

        // UNIVERS → déjà format string[]
        setUniverses(userRes?.universes ?? []);

        // AVAILABLE UNIVERS
        setAvailableUniverses(universeRes?.universes ?? []);

      } catch (e) {
        console.error("❌ load error", e);
        alert("Erreur chargement utilisateur");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    }

    if (userId) load();
  }, [userId, router]);

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

      const res = await api.post("/user/update", {
        user_id: userId,
        name,
        company,
        language,
        role,
        universes,
      });

      if (res?.status !== "ok") {
        throw new Error("Update failed");
      }

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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Modifier utilisateur
        </h1>

        <Link href="/admin/users" className="text-sm underline">
          ← Retour
        </Link>
      </div>

      {/* EMAIL */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Email</label>
        <input
          className="border p-2 w-full rounded bg-gray-100"
          value={email}
          disabled
        />
      </div>

      {/* NAME */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Nom</label>
        <input
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* COMPANY */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Société</label>
        <input
          className="border p-2 w-full rounded"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {/* LANGUAGE */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Langue</label>
        <select
          className="border p-2 rounded w-full max-w-xs"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* ROLE */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">Rôle</label>
        <select
          className="border p-2 rounded w-full max-w-xs"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* UNIVERS */}
      <div className="space-y-2">
        <label className="font-medium">Univers</label>

        <div className="grid grid-cols-2 gap-2">
          {availableUniverses.map((u) => (
            <label
              key={u.ID_UNIVERSE}
              className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-50"
            >
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
