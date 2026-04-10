"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

type Universe = {
  ID_UNIVERSE: string;
  LABEL: string;
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = params.id as string;
  const email = searchParams.get("email"); // 🔥 important

  const [universes, setUniverses] = useState<Universe[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    async function load() {
      try {
        // 🔹 univers
        const u = await api.get("/universe/list");
        setUniverses(u.universes || []);

        // 🔹 user context
        if (email) {
          const ctx = await api.get(`/user/context?email=${email}`);
          setSelected(ctx.universes || []);
        }
      } catch (e) {
        console.error("❌ error loading edit page", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [email]);

  // =====================================================
  // TOGGLE
  // =====================================================

  function toggleUniverse(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  }

  // =====================================================
  // SAVE
  // =====================================================

  async function handleSave() {
    try {
      await api.post("/user/assign-universes", {
        user_id: userId,
        universes: selected,
      });

      alert("Univers mis à jour");
      router.push("/admin/users");
    } catch (e) {
      console.error("❌ save error", e);
      alert("Erreur lors de la sauvegarde");
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-xl font-semibold">
        Edit user universes
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">

        {universes.map((u) => (
          <label
            key={u.ID_UNIVERSE}
            className="flex items-center gap-3"
          >
            <input
              type="checkbox"
              checked={selected.includes(u.ID_UNIVERSE)}
              onChange={() => toggleUniverse(u.ID_UNIVERSE)}
            />
            <span>{u.LABEL}</span>
          </label>
        ))}

        <button
          onClick={handleSave}
          className="w-full bg-ratecard-blue text-white rounded-lg py-2 text-sm font-medium"
        >
          Sauvegarder
        </button>

      </div>
    </div>
  );
}
