"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type DrawerType = "news" | "content";

type DrawerState = {
  open: boolean;
  type: DrawerType | null;
  id: string | null;
};

type DrawerContextType = {
  state: DrawerState;
  openDrawer: (type: DrawerType, id: string) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>({
    open: false,
    type: null,
    id: null,
  });

  function openDrawer(type: DrawerType, id: string) {
    setState({
      open: true,
      type,
      id,
    });
  }

  function closeDrawer() {
    setState({
      open: false,
      type: null,
      id: null,
    });
  }

  return (
    <DrawerContext.Provider
      value={{ state, openDrawer, closeDrawer }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useDrawer must be used inside DrawerProvider");
  }
  return ctx;
}
