"use client";

import { useDrawer } from "@/contexts/DrawerContext";

// LEFT DRAWERS
import CompanyDrawer from "@/components/drawers/CompanyDrawer";
// (à venir)
import TopicDrawer from "@/components/drawers/TopicDrawer";
import SolutionDrawer from "@/components/drawers/SolutionDrawer";

// RIGHT DRAWERS
import NewsDrawer from "@/components/drawers/NewsDrawer";
import AnalysisDrawerAdmin from "@/components/drawers/AnalysisDrawer";

/* =========================================================
   HOST — CURATOR
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
      {/* =========================================
          LEFT — COMPANY
      ========================================= */}
      {leftDrawer.type === "company" && leftDrawer.id && (
        <CompanyDrawer
          id={leftDrawer.id}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          LEFT — TOPIC (future)
      ========================================= */}
      {leftDrawer.type === "topic" && leftDrawer.id && (
        <TopicDrawer
          id={leftDrawer.id}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          LEFT — SOLUTION (future)
      ========================================= */}
      {leftDrawer.type === "solution" && leftDrawer.id && (
        <SolutionDrawer
          id={leftDrawer.id}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          RIGHT — NEWS
      ========================================= */}
      {rightDrawer.type === "news" && rightDrawer.id && (
        <NewsDrawer
          id={rightDrawer.id}
          onClose={closeRightDrawer}
        />
      )}

      {/* =========================================
          RIGHT — ANALYSIS
      ========================================= */}
      {rightDrawer.type === "analysis" && rightDrawer.id && (
        <AnalysisDrawer
          contentId={rightDrawer.id}
          onClose={closeRightDrawer}
        />
      )}
    </>
  );
}
