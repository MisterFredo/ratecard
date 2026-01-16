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

export type DrawerType =
  | "news"
  | "analysis"
  | "member"
  | null;

type DrawerState = {
  type: DrawerType;
  id: string | null;
};

type DrawerContextType = {
  drawer: DrawerState;
  openDrawer: (type: DrawerType, id: string) => void;
  closeDrawer: () => void;
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
  const [drawer, setDrawer] = useState<DrawerState>({
    type: null,
    id: null,
  });

  function openDrawer(type: DrawerType, id: string) {
    setDrawer({ type, id });
  }

  function closeDrawer() {
    setDrawer({ type: null, id: null });
  }

  return (
    <DrawerContext.Provider
      value={{ drawer, openDrawer, closeDrawer }}
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
