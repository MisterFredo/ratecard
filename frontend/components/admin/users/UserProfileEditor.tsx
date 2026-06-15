"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

/* ========================================================= */

type Props = {
  userId: string;
};

type UserProfile = {
  geography_1?: string | null;
  geography_2?: string | null;
  geography_3?: string | null;
  profile_text?: string | null;
};

/* ========================================================= */

export default function UserProfileEditor({
  userId,
}: Props) {

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [profileText, setProfileText] =
    useState("");

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {

    async function load() {

      try {

        setLoading(true);

        const res = await api.get(
          `/user/profile/${userId}`
        );

        const profile: UserProfile =
          res?.profile || {};

        setProfileText(
          profile.profile_text || ""
        );

      } catch (e) {

        console.error(
          "❌ profile load",
          e
        );

      } finally {

        setLoading(false);

      }
    }

    if (userId) {
      load();
    }

  }, [userId]);

  /* =====================================================
     SAVE
  ===================================================== */

  async function save() {

    try {

      setSaving(true);

      await api.post(
        "/user/profile/update",
        {
          user_id: userId,

          profile_text:
            profileText || null,
        }
      );

      alert(
        "Profil enregistré"
      );

    } catch (e) {

      console.error(
        "❌ profile save",
        e
      );

      alert(
        "Erreur sauvegarde"
      );

    } finally {

      setSaving(false);

    }
  }

  /* =====================================================
     UI
  ===================================================== */

  if (loading) {

    return (

      <div className="
        border
        rounded-lg
        p-6
      ">
        Chargement...
      </div>

    );
  }

  return (

    <div className="
      border
      rounded-lg
      p-6
      space-y-4
    ">

      <div>

        <h2 className="
          text-lg
          font-semibold
        ">
          Profil IA
        </h2>

        <p className="
          text-sm
          text-gray-500
          mt-1
        ">
          Informations stratégiques
          utilisées pour générer
          des analyses personnalisées.
        </p>

      </div>

      <textarea
        value={profileText}
        onChange={(e) =>
          setProfileText(
            e.target.value
          )
        }
        rows={12}
        className="
          w-full
          border
          rounded
          p-3
          text-sm
        "
        placeholder={`
Exemple :

Global Digital Director

Priorités :
- eB2B
- Quick Commerce
- Data Ownership

Concurrents :
- Diageo
- Pernod
- Brown Forman

Questions :
- évolution du 3-tier system
- premiumization
- gifting
        `}
      />

      <button
        onClick={save}
        disabled={saving}
        className="
          bg-ratecard-blue
          text-white
          px-4
          py-2
          rounded
        "
      >

        {saving
          ? "Sauvegarde..."
          : "Enregistrer"}

      </button>

    </div>
  );
}
