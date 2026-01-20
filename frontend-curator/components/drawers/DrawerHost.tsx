"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

/* =========================================================
   HOST — CENTRALIZED RENDERING OF CURATOR DRAWERS
========================================================= */

export default function DrawerHost() {
  const {
    rightDrawer,
    closeRightDrawer,
  } = useDrawer();

  return (
    <>
      {/* DRAWER — ANALYSIS */}
      {rightDrawer.type === "analysis" && rightDrawer.id && (
        <AnalysisDrawer
          id={rightDrawer.id}
          onClose={closeRightDrawer}
        />
      )}
    </>
  );
}
