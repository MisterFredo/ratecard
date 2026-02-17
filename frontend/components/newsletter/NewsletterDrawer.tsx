"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function NewsletterDrawer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();

      setSuccess(true);
      setEmail("");
    } catch {
      setError(true);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h2 className="text-2xl font-semibold mb-4">
        Recevoir les lectures Ratecard
      </h2>

      <p className="text-sm text-gray-600 mb-8">
        Analyses, signaux marché et synthèses exclusives.
      </p>

      {success ? (
        <div className="text-green-600 text-sm">
          Merci — vous êtes inscrit.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-ratecard-blue
              text-white
              rounded-lg
              py-2
              text-sm
              hover:opacity-90
              transition
            "
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {error && (
            <div className="text-red-500 text-xs">
              Une erreur est survenue.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
