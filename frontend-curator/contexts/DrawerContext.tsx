"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* =========================================================
   TYPES — CURATOR
========================================================= */

/**
 * Types de drawer supportés
 */
export type DrawerType =
  | "dashboard"
  | "analysis"
  | "synthesis"
  | null;

export type DrawerSide = "left" | "right";

/**
 * Payloads spécifiques par type de drawer
 */
export type DashboardPayload = {
  scopeType: "topic" | "company";
  scopeId: string;
};

/**
 * Payload pour le drawer de lecture (analysis)
 * - source = "analysis" (par défaut)
 * - source = "news" → SourceDrawer
 */
export type AnalysisPayload = {
  id: string;
  source?: "analysis" | "news";
};

/**
 * Union des payloads
 */
type DrawerPayload =
  | { type: "dashboard"; payload: DashboardPayload }
  | { type: "analysis"; payload: AnalysisPayload }
  | { type: "synthesis"; payload: { id: string } }
  | { type: null; payload: null };

/**
 * État interne d’un drawer
 */
type DrawerState = DrawerPayload;

/**
 * API exposée par le contexte
 */
type DrawerContextType = {
  leftDrawer: DrawerState;
  rightDrawer: DrawerState;

  openDrawer: (
    side: DrawerSide,
    drawer: Exclude<DrawerPayload, { type: null }>
  ) => void;

  closeDrawer: (side: DrawerSide) => void;
};

/* =========================================================
   CONTEXT
========================================================= */

const DrawerContext = createContext<DrawerContextType | null>(
  null
);

/* =========================================================
   PROVIDER
========================================================= */

export function DrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [leftDrawer, setLeftDrawer] = useState<DrawerState>({
    type: null,
    payload: null,
  });

  const [rightDrawer, setRightDrawer] = useState<DrawerState>({
    type: null,
    payload: null,
  });

  /* -----------------------------
     OPEN / CLOSE
  ----------------------------- */
  function openDrawer(
    side: DrawerSide,
    drawer: Exclude<DrawerPayload, { type: null }>
  ) {
    if (side === "left") {
      setLeftDrawer(drawer);
    } else {
      setRightDrawer(drawer);
    }
  }

  function closeDrawer(side: DrawerSide) {
    if (side === "left") {
      setLeftDrawer({ type: null, payload: null });
    } else {
      setRightDrawer({ type: null, payload: null });
    }
  }

  return (
    <DrawerContext.Provider
      value={{
        leftDrawer,
        rightDrawer,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error(
      "useDrawer must be used within DrawerProvider"
    );
  }
  return ctx;
}
