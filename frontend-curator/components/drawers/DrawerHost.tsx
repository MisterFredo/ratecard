"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

/* =========================================================
   HOST — CURATOR DRAWERS
========================================================= */

export default function DrawerHost() {
  const {
    rightDrawer,
    closeDrawer,
  } = useDrawer();

  return (
    <>
      {rightDrawer.type === "analysis" && rightDrawer.id && (
        <AnalysisDrawer
          id={rightDrawer.id}
          onClose={() => closeDrawer("right")}
        />
      )}
    </>
  );
}
