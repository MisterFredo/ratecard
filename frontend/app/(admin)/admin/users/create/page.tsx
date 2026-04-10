"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Universe = {
  ID_UNIVERSE: string;
  LABEL: string;
};

export default function CreateUserPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("fr");

  const [universes, setUniverses] = useState<string[]>([]);
  const [availableUniverses, setAvailableUniverses] = useState<Universe[]>([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD UNIVERS
  // =====================================================

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/universe/list");
        setAvailableUniverses(res.universes || []);
      } catch (e) {
        console.error("❌ error loading universes", e);
      }
    }

    load();
  }, []);

  // =====================================================
  // TOGGLE
  // =====================================================

  function toggleUniverse(id: string) {
    setUniverses((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  // =====================================================
  // CREATE USER
  // =====================================================

  async function handleCreate() {
    if (!email || !password) {
      alert("Email et mot de passe requis");
      return;
    }

    setLoading(true);

    try {
      await api.post("/user/create", {
        email,
        password,
        name,
        company,
        language,
        universes,
      });

      router.push("/admin/users");
    } catch (e) {
      console.error("❌ create user error", e);
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-xl font-semibold">
        Create user
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="text"
          placeholder="Société"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>

        {/* UNIVERS DYNAMIQUE */}
        <div>
          <p className="text-sm font-medium mb-2">
            Univers
          </p>

          <div className="flex flex-wrap gap-2">
            {availableUniverses.map((u) => (
              <button
                key={u.ID_UNIVERSE}
                type="button"
                onClick={() => toggleUniverse(u.ID_UNIVERSE)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  universes.includes(u.ID_UNIVERSE)
                    ? "bg-ratecard-blue text-white border-ratecard-blue"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {u.LABEL}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-ratecard-blue text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Création…" : "Créer l’utilisateur"}
        </button>

      </div>
    </div>
  );
}
