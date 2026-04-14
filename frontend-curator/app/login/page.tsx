"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // 🔐 CLEAN SESSION (évite bugs)
  // --------------------------------------------------
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
  }, []);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  async function handleLogin() {
    if (!email.trim()) {
      alert("Email requis");
      return;
    }

    if (!password.trim()) {
      alert("Mot de passe requis");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/user/login", {
        email,
        password,
      });

      if (!res || res.status !== "ok" || !res.token) {
        throw new Error("Login failed");
      }

      // 🔥 STOCKAGE TOKEN
      localStorage.setItem("token", res.token);
      localStorage.setItem("user_id", res.user_id);
      localStorage.setItem("role", res.role);

      // 🔥 REDIRECT PROPRE
      router.push(redirect);

    } catch (e) {
      console.error(e);
      alert("Accès non autorisé");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-4">
        
        <h1 className="text-lg font-semibold text-gray-900">
          Accès Curator
        </h1>

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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>

      </div>
    </div>
  );
}
