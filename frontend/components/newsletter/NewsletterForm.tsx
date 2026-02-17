"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Adresse email invalide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/public/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        throw new Error("Erreur inscription");
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Impossible de vous inscrire pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-700">
          Merci. Votre inscription a bien été prise en compte.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border border-gray-200 rounded-lg space-y-4"
    >
      <div>
        <h3 className="text-lg font-medium">
          Recevez les lectures Ratecard
        </h3>
        <p className="text-sm text-gray-600">
          Analyses, signaux marché et événements.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "…" : "S’inscrire"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
