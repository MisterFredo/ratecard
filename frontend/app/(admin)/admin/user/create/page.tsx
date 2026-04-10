"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CreateUserPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState("fr");

  const [loading, setLoading] = useState(false);

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

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* NAME */}
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* COMPANY */}
        <input
          type="text"
          placeholder="Société"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* LANGUAGE */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>

        {/* ACTION */}
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
