"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type DrawerTypeLeft = "member" | null;
type DrawerTypeRight = "news" | "analysis" | null;

type DrawerMode = "silent" | "route";

type DrawerSlot = {
  type: DrawerTypeLeft | DrawerTypeRight;
  id: string | null;
  mode: DrawerMode | null;
};

type DrawerContextType = {
  leftDrawer: DrawerSlot;
  rightDrawer: DrawerSlot;

  openLeftDrawer: (
    type: "member",
    id: string,
    mode?: DrawerMode
  ) => void;

  openRightDrawer: (
    type: "news" | "analysis",
    id: string,
    mode?: DrawerMode
  ) => void;

  closeLeftDrawer: () => void;
  closeRightDrawer: () => void;
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
  const [leftDrawer, setLeftDrawer] = useState<DrawerSlot>({
    type: null,
    id: null,
    mode: null,
  });

  const [rightDrawer, setRightDrawer] = useState<DrawerSlot>({
    type: null,
    id: null,
    mode: null,
  });

  /* -----------------------------
     OPEN / CLOSE — LEFT
  ----------------------------- */
  function openLeftDrawer(
    type: "member",
    id: string,
    mode: DrawerMode = "silent"
  ) {
    setLeftDrawer({ type, id, mode });
  }

  function closeLeftDrawer() {
    setLeftDrawer({ type: null, id: null, mode: null });
  }

  /* -----------------------------
     OPEN / CLOSE — RIGHT
  ----------------------------- */
  function openRightDrawer(
    type: "news" | "analysis",
    id: string,
    mode: DrawerMode = "silent"
  ) {
    setRightDrawer({ type, id, mode });
  }

  function closeRightDrawer() {
    setRightDrawer({ type: null, id: null, mode: null });
  }

  return (
    <DrawerContext.Provider
      value={{
        leftDrawer,
        rightDrawer,
        openLeftDrawer,
        openRightDrawer,
        closeLeftDrawer,
        closeRightDrawer,
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
