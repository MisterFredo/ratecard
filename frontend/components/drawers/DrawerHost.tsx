"use client";

import { useDrawer } from "@/contexts/DrawerContext";

// DRAWERS
import MemberDrawer from "@/components/drawers/MemberDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

/* =========================================================
   HOST — RENDU CENTRALISÉ DES DRAWERS
========================================================= */

export default function DrawerHost() {
  const {
    leftDrawer,
    rightDrawer,
    closeLeftDrawer,
    closeRightDrawer,
  } = useDrawer();

  return (
    <>
      {/* DRAWER GAUCHE — PARTENAIRE */}
      {leftDrawer.type === "member" && leftDrawer.id && (
        <MemberDrawer
          id={leftDrawer.id}
          onClose={closeLeftDrawer}
        />
      )}

      {/* DRAWER DROITE — NEWS */}
      {rightDrawer.type === "news" && rightDrawer.id && (
        <NewsDrawer
          id={rightDrawer.id}
          onClose={closeRightDrawer}
        />
      )}
    </>
  );
}
