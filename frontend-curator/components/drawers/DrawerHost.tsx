"use client";

import { useDrawer } from "@/contexts/DrawerContext";

// LEFT DRAWERS
import CompanyDrawer from "@/components/drawers/CompanyDrawer";
import TopicDrawer from "@/components/drawers/TopicDrawer";
import SolutionDrawer from "@/components/drawers/SolutionDrawer";

// RIGHT DRAWERS
import NewsDrawer from "@/components/drawers/NewsDrawer";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import RadarDrawer from "@/components/drawers/RadarDrawer";
import NumberDrawer from "@/components/drawers/NumberDrawer"; // ✅ NEW

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

  const leftType = leftDrawer.type;
  const leftId = leftDrawer.id;

  const rightType = rightDrawer.type;
  const rightId = rightDrawer.id;
  const rightPayload = rightDrawer.payload; // ✅ NEW

  return (
    <>
      {/* =========================================
          LEFT — COMPANY
      ========================================= */}
      {leftType === "company" && leftId && (
        <CompanyDrawer
          id={leftId}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          LEFT — TOPIC
      ========================================= */}
      {leftType === "topic" && leftId && (
        <TopicDrawer
          id={leftId}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          LEFT — SOLUTION
      ========================================= */}
      {leftType === "solution" && leftId && (
        <SolutionDrawer
          id={leftId}
          onClose={closeLeftDrawer}
        />
      )}

      {/* =========================================
          RIGHT — NEWS
      ========================================= */}
      {rightType === "news" && rightId && (
        <NewsDrawer
          id={rightId}
          onClose={closeRightDrawer}
        />
      )}

      {/* =========================================
          RIGHT — ANALYSIS
      ========================================= */}
      {rightType === "analysis" && rightId && (
        <AnalysisDrawer
          id={rightId}
          onClose={closeRightDrawer}
        />
      )}

      {/* =========================================
          RIGHT — RADAR
      ========================================= */}
      {rightType === "radar" && rightId && (
        <RadarDrawer
          id={rightId}
          onClose={closeRightDrawer}
        />
      )}

      {/* =========================================
          RIGHT — NUMBERS ✅ NEW
      ========================================= */}
      {rightType === "numbers" && rightId && (
        <NumberDrawer
          id={rightId}
          entityType={rightPayload?.entityType} // ✅ clé
          onClose={closeRightDrawer}
        />
      )}
    </>
  );
}
