"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import DashboardDrawer from "@/components/drawers/DashboardDrawer";
import SourceDrawer from "@/components/drawers/SourceDrawer";

/* =========================================================
   HOST — CURATOR DRAWERS
========================================================= */

export default function DrawerHost() {
  const {
    leftDrawer,
    rightDrawer,
    closeDrawer,
  } = useDrawer();

  return (
    <>
      {/* =====================================================
          DRAWER GAUCHE — DASHBOARD (TOPIC / COMPANY)
      ===================================================== */}
      {leftDrawer.type === "dashboard" &&
        leftDrawer.payload && (
          <DashboardDrawer
            scopeType={leftDrawer.payload.scopeType}
            scopeId={leftDrawer.payload.scopeId}
            onClose={() => closeDrawer("left")}
          />
        )}

      {/* =====================================================
          DRAWER DROIT — LECTURE
          - Analysis (par défaut)
          - Source (news)
      ===================================================== */}
      {rightDrawer.type === "analysis" &&
        rightDrawer.payload && (
          rightDrawer.payload.source === "news" ? (
            <SourceDrawer
              id={rightDrawer.payload.id}
              onClose={() => closeDrawer("right")}
            />
          ) : (
            <AnalysisDrawer
               key={rightDrawer.payload.id}
               id={rightDrawer.payload.id}
               onClose={() => closeDrawer("right")}
            />
          )
        )}
    </>
  );
}
