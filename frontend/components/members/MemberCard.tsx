"use client";

import { useRouter } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  id: string;
  name: string;
  description?: string | null; // HTML
  visualRectId?: string | null;
};

/* ---------------------------------------------------------
   UTIL — strip HTML → texte propre
--------------------------------------------------------- */
function stripHtml(html: string): string {
  if (typeof window === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

export default function MemberCard({
  id,
  name,
  description,
  visualRectId,
}: Props) {
  const router = useRouter();
  const { openLeftDrawer } = useDrawer(); // ✅ API CORRECTE

  const visualUrl = visualRectId
    ? `${GCS_BASE_URL}/companies/${visualRectId}`
    : null;

  const cleanDescription = description
    ? stripHtml(description)
    : null;

  return (
    <div
      onClick={() => {
        router.push(`/members?member_id=${id}`, { scroll: false });
        openLeftDrawer("member", id); // ✅ drawer GAUCHE
      }}
      className="
        group cursor-pointer rounded-2xl
        border border-ratecard-border
        bg-white shadow-card transition
        hover:shadow-cardHover overflow-hidden
      "
    >
      {/* VISUEL */}
      <div className="relative h-44 w-full bg-ratecard-light overflow-hidden">
        {visualUrl ? (
          <img
            src={visualUrl}
            alt={name}
            className="
              h-full w-full object-contain
              p-6 transition-transform duration-300
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            Aucun visuel
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
          {name}
        </h3>

        {cleanDescription && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {cleanDescription}
          </p>
        )}
      </div>
    </div>
  );
}
