"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Props = {
  onClose?: () => void;
};

export default function NewsletterDrawer({ onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  function close() {
    setIsOpen(false);
    setTimeout(() => {
      onClose?.();
      setSuccess(false);
      setError(false);
      setEmail("");
      setFirstName("");
      setLastName("");
      setCompany("");
    }, 250);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(
        `${API_BASE}/public/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
            company,
          }),
        }
      );

      if (!res.ok) throw new Error();

      setSuccess(true);
      setEmail("");
      setFirstName("");
      setLastName("");
      setCompany("");
    } catch {
      setError(true);
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={close}
      />

      {/* DRAWER RIGHT */}
      <aside
        className={`
          relative ml-auto w-full md:w-[520px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-5 flex items-start justify-between">
          <div className="space-y-1 max-w-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Newsletter
            </p>

            <h2 className="text-xl font-semibold text-gray-900">
              Recevoir les Newsletters Ratecard
            </h2>
          </div>

          <button onClick={close} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-10">
          <p className="text-sm text-gray-600 mb-8">
            Analyses, signaux marché et synthèses exclusives.
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="text-green-600 text-sm">
                Merci — vous êtes inscrit.
              </div>

              <button
                onClick={close}
                className="text-sm text-ratecard-blue hover:underline"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PRÉNOM */}
              <input
                type="text"
                required
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-4 py-3
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-ratecard-blue/30
                "
              />

              {/* NOM */}
              <input
                type="text"
                required
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-4 py-3
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-ratecard-blue/30
                "
              />

              {/* SOCIÉTÉ */}
              <input
                type="text"
                required
                placeholder="Société"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-4 py-3
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-ratecard-blue/30
                "
              />

              {/* EMAIL */}
              <input
                type="email"
                required
                placeholder="Email professionnel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-4 py-3
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-ratecard-blue/30
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-ratecard-blue
                  text-white
                  rounded-lg
                  py-3
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
      </aside>
    </div>
  );
}
