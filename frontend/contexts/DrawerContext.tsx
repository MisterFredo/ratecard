"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<DrawerState>({
    open: false,
    type: null,
    id: null,
  });

  /* -------------------------------------------------------
     OPEN DRAWER (AND SYNC URL)
  ------------------------------------------------------- */
  function openDrawer(type: DrawerType, id: string) {
    setState({
      open: true,
      type,
      id,
    });

    const params = new URLSearchParams();
    params.set(type, id);

    router.replace(`/?${params.toString()}`, {
      scroll: false,
    });
  }

  /* -------------------------------------------------------
     CLOSE DRAWER (AND CLEAN URL)
  ------------------------------------------------------- */
  function closeDrawer() {
    setState({
      open: false,
      type: null,
      id: null,
    });

    router.replace("/", { scroll: false });
  }

  /* -------------------------------------------------------
     AUTO-OPEN FROM URL
  ------------------------------------------------------- */
  useEffect(() => {
    const newsId = searchParams.get("news");
    const contentId = searchParams.get("content");

    if (newsId) {
      setState({
        open: true,
        type: "news",
        id: newsId,
      });
    }

    if (contentId) {
      setState({
        open: true,
        type: "content",
        id: contentId,
      });
    }
  }, [searchParams]);

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
