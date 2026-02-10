"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Mot de passe invalide");
      }

      router.push(redirect);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">
          Admin Ratecard
        </h1>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />

        {error && (
          <div className="text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded-md text-sm disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}
