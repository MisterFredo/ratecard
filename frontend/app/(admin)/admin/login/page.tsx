"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ADMIN_EMAIL = "mister.fredo@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      alert("Email requis");
      return;
    }

    setLoading(true);

    try {
      if (email.toLowerCase() !== ADMIN_EMAIL) {
        alert("Accès non autorisé");
        return;
      }

      // 👉 cookie simple (front only, suffisant ici)
      document.cookie = `ratecard_admin_session=ok; path=/; max-age=86400`;

      router.push(redirect);
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

        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
