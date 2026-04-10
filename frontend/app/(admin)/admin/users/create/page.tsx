"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Universe = {
  ID_UNIVERSE: string;
  LABEL: string;
};

export default function CreateUser() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("fr");
  const [role, setRole] = useState("user");

  const [universes, setUniverses] = useState<string[]>([]);
  const [availableUniverses, setAvailableUniverses] = useState<Universe[]>([]);

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     LOAD UNIVERS
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadUniverses() {
      try {
        const res = await api.get("/universe/list");
        setAvailableUniverses(res?.universes ?? []);
      } catch (e) {
        console.error("Erreur chargement univers", e);
        setAvailableUniverses([]);
      }
    }

    loadUniverses();
  }, []);

  /* ---------------------------------------------------------
     HANDLE MULTI SELECT
  --------------------------------------------------------- */
  function toggleUniverse(id: string) {
    setUniverses((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  }

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {
    if (!email.trim() || !password.trim()) {
      alert("Email et mot de passe requis");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/create", {
        email,
        password,
        name: name || null,
        company: company || null,
        language,
        role,
        universes,
      });

      if (!res?.user_id) {
        throw new Error("ID user manquant");
      }

      alert("Utilisateur créé");

      // 👉 redirect propre (meilleur UX)
      router.push("/admin/users");

    } catch (e) {
      console.error(e);
      alert("❌ Erreur création");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter un utilisateur
        </h1>

        <Link href="/admin/users" className="underline">
          ← Retour
        </Link>
      </div>

      {/* EMAIL */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* PASSWORD */}
      <input
        type="password"
        className="border p-2 w-full rounded"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        disabled={loading}
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {loading ? "Création…" : "Créer"}
      </button>

    </div>
  );
}
