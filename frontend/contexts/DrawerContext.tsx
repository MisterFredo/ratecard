"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

type DrawerType = "news" | "analysis" | null;

type DrawerState = {
  type: DrawerType;
  id: string | null;
};

type DrawerContextType = {
  drawer: DrawerState;
  openDrawer: (type: DrawerType, id: string) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(
  null
);

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

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error(
      "useDrawer must be used within DrawerProvider"
    );
  }
  return ctx;
}
