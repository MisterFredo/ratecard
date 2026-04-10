"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      alert("Email et mot de passe requis");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/user/login", {
        email,
        password,
      });

      if (!res || res.status !== "ok") {
        throw new Error("Login failed");
      }

      // 🔐 SESSION PROPRE
      document.cookie = `curator_session=${res.user_id}; path=/; max-age=86400`;

      // 🔥 optionnel (utile debug / futur)
      document.cookie = `curator_role=${res.role}; path=/; max-age=86400`;

      router.push(redirect);

    } catch (e) {
      console.error(e);
      alert("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Connexion admin
        </h1>

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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-ratecard-blue text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}
