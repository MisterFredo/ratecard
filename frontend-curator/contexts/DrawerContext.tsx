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

export type DrawerType = "analysis" | "synthesis" | null;
export type DrawerSide = "left" | "right";

type DrawerState = {
  type: DrawerType;
  id: string | null;
};

type DrawerContextType = {
  leftDrawer: DrawerState;
  rightDrawer: DrawerState;

  openDrawer: (
    side: DrawerSide,
    type: Exclude<DrawerType, null>,
    id: string
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
    id: null,
  });

  const [rightDrawer, setRightDrawer] = useState<DrawerState>({
    type: null,
    id: null,
  });

  /* -----------------------------
     OPEN / CLOSE
  ----------------------------- */
  function openDrawer(
    side: DrawerSide,
    type: Exclude<DrawerType, null>,
    id: string
  ) {
    if (side === "left") {
      setLeftDrawer({ type, id });
    } else {
      setRightDrawer({ type, id });
    }
  }

  function closeDrawer(side: DrawerSide) {
    if (side === "left") {
      setLeftDrawer({ type: null, id: null });
    } else {
      setRightDrawer({ type: null, id: null });
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
