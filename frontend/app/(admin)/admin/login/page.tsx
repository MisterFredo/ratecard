"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

const ADMIN_EMAIL = "mister.fredo@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 🔥 NEW
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      alert("Email requis");
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // 🔥 ADMIN BYPASS (PRIORITAIRE)
      // =====================================================

      if (email.toLowerCase() === ADMIN_EMAIL) {
        document.cookie = "ratecard_admin_session=ok; path=/; max-age=86400";
        document.cookie = `curator_email=${email}; path=/; max-age=86400`;

        router.push(redirect);
        return;
      }

      // =====================================================
      // 🔐 LOGIN NORMAL (USERS)
      // =====================================================

      if (!password) {
        alert("Mot de passe requis");
        return;
      }

      const res = await api.post("/user/login", {
        email,
        password,
      });

      if (res?.status === "ok") {
        document.cookie = "ratecard_admin_session=ok; path=/; max-age=86400";
        document.cookie = `curator_email=${email}; path=/; max-age=86400`;

        router.push(redirect);
        return;
      }

      alert("Accès non autorisé");

    } catch (e) {
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Accès admin Ratecard
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* PASSWORD (inutile pour admin, utile pour users) */}
        <input
          type="password"
          placeholder="Mot de passe (optionnel pour admin)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-ratecard-blue text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Connexion…" : "Accéder"}
        </button>
      </div>
    </div>
  );
}
