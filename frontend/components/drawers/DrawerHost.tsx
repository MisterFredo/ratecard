"use client";

import { useDrawer } from "@/contexts/DrawerContext";

// DRAWERS EXISTANTS
import NewsDrawer from "@/components/drawers/NewsDrawer";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

// NOUVEAU DRAWER PARTENAIRE (GAUCHE)
import MemberDrawer from "@/components/drawers/MemberDrawer";

/* =========================================================
   HOST — RENDU CENTRALISÉ DES DRAWERS
========================================================= */

export default function DrawerHost() {
  const { drawer, closeDrawer } = useDrawer();

  if (!drawer.type || !drawer.id) {
    return null;
  }

  return (
    <>
      {/* DRAWER PARTENAIRE — GAUCHE */}
      {drawer.type === "member" && (
        <MemberDrawer
          id={drawer.id}
          onClose={closeDrawer}
        />
      )}

      {/* DRAWER NEWS — DROITE */}
      {drawer.type === "news" && (
        <NewsDrawer
          id={drawer.id}
          onClose={closeDrawer}
        />
      )}

      {/* DRAWER ANALYSIS — DROITE */}
      {drawer.type === "analysis" && (
        <AnalysisDrawer
          id={drawer.id}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
