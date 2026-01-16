"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";
import MemberCard from "@/components/members/MemberCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES — alignés avec PublicMembersResponse
========================================================= */

type Member = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;
};

/* =========================================================
   FETCH
========================================================= */

async function fetchMembers(): Promise<Member[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/public/members`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const json = await res.json();
  return json.items || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const { openLeftDrawer } = useDrawer();
  const searchParams = useSearchParams();

  // 🔒 garde-fou anti-réouverture
  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     Chargement des partenaires
  --------------------------------------------------------- */
  useEffect(() => {
    fetchMembers().then(setMembers);
  }, []);

  /* ---------------------------------------------------------
     Ouverture du drawer pilotée par l’URL
     /members?member_id=XXXX
  --------------------------------------------------------- */
  useEffect(() => {
    const memberId = searchParams.get("member_id");

    // aucun drawer demandé → reset
    if (!memberId) {
      lastOpenedId.current = null;
      return;
    }

    // déjà ouvert → ne rien faire
    if (lastOpenedId.current === memberId) {
      return;
    }

    // ouverture légitime — DRAWER GAUCHE
    lastOpenedId.current = memberId;
    openLeftDrawer("member", memberId);

  }, [searchParams, openLeftDrawer]);

  return (
    <div className="space-y-12 md:space-y-14">
      {/* =====================================================
          LISTE DES MEMBRES — PARTENAIRES
      ===================================================== */}
      {members.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun partenaire pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <MemberCard
              key={m.id_company}
              id={m.id_company}
              name={m.name}
              description={m.description}
              visualRectId={m.media_logo_rectangle_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

