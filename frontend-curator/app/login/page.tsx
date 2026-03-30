"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACCESS_EMAIL = "mister.fredo@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      alert("Email requis");
      return;
    }

    setLoading(true);

    try {
      if (email.toLowerCase() !== ACCESS_EMAIL) {
        alert("Accès non autorisé");
        return;
      }

      document.cookie = `curator_session=ok; path=/; max-age=86400`;

      router.push(redirect);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">
          Accès privé Curator
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium"
        >
          {loading ? "Connexion…" : "Accéder"}
        </button>
      </div>
    </div>
  );
}
