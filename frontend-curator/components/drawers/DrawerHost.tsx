"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import DashboardDrawer from "@/components/drawers/DashboardDrawer";

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
          DRAWER DROIT — ANALYSE
      ===================================================== */}
      {rightDrawer.type === "analysis" &&
        rightDrawer.payload && (
          <AnalysisDrawer
            id={rightDrawer.payload.id}
            onClose={() => closeDrawer("right")}
          />
        )}
    </>
  );
}

