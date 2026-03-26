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

type DrawerTypeLeft =
  | "member"
  | "company"
  | "topic"
  | "solution"
  | null;

type DrawerTypeRight =
  | "news"
  | "analysis"
  | "newsletter"
  | "radar"
  | "numbers" // ✅ NEW
  | null;

type DrawerMode = "silent" | "route";

type DrawerSlot = {
  type: DrawerTypeLeft | DrawerTypeRight;
  id: string | null;
  mode: DrawerMode | null;
  payload?: any; // ✅ NEW
};

type DrawerContextType = {
  leftDrawer: DrawerSlot;
  rightDrawer: DrawerSlot;

  openLeftDrawer: (
    type: "member" | "company" | "topic" | "solution",
    id: string,
    mode?: DrawerMode
  ) => void;

  openRightDrawer: (
    type: "news" | "analysis" | "radar" | "numbers",
    id: string,
    mode?: DrawerMode,
    payload?: any // ✅ NEW
  ) => void;

  openNewsletterDrawer: (
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
    payload: undefined,
  });

  const [rightDrawer, setRightDrawer] = useState<DrawerSlot>({
    type: null,
    id: null,
    mode: null,
    payload: undefined,
  });

  /* -----------------------------
     OPEN / CLOSE — LEFT
  ----------------------------- */

  function openLeftDrawer(
    type: "member" | "company" | "topic" | "solution",
    id: string,
    mode: DrawerMode = "silent"
  ) {
    setLeftDrawer({
      type,
      id,
      mode,
      payload: undefined,
    });
  }

  function closeLeftDrawer() {
    setLeftDrawer({
      type: null,
      id: null,
      mode: null,
      payload: undefined,
    });
  }

  /* -----------------------------
     OPEN / CLOSE — RIGHT
  ----------------------------- */

  function openRightDrawer(
    type: "news" | "analysis" | "radar" | "numbers",
    id: string,
    mode: DrawerMode = "silent",
    payload?: any
  ) {
    setRightDrawer({
      type,
      id,
      mode,
      payload,
    });
  }

  function openNewsletterDrawer(
    mode: DrawerMode = "silent"
  ) {
    setRightDrawer({
      type: "newsletter",
      id: null,
      mode,
      payload: undefined,
    });
  }

  function closeRightDrawer() {
    setRightDrawer({
      type: null,
      id: null,
      mode: null,
      payload: undefined,
    });
  }

  return (
    <DrawerContext.Provider
      value={{
        leftDrawer,
        rightDrawer,
        openLeftDrawer,
        openRightDrawer,
        openNewsletterDrawer,
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
