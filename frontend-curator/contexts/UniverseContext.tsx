"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Universe = {
  id_universe: string;
  label: string;
};

type UniverseContextType = {
  universes: Universe[];
  activeUniverse: string | null;
  setActiveUniverse: (id: string | null) => void;
};

const UniverseContext = createContext<UniverseContextType | null>(null);

export function UniverseProvider({ children }: { children: React.ReactNode }) {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [activeUniverse, setActiveUniverse] = useState<string | null>(null);

  // --------------------------------------------------
  // LOAD USER UNIVERS
  // --------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const email = document.cookie
          .split("; ")
          .find((c) => c.startsWith("curator_email="))
          ?.split("=")[1];

        if (!email) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/context?email=${email}`
        );

        const json = await res.json();

        const u = json?.universes || [];

        setUniverses(u);

        // 👉 default = premier univers
        if (u.length > 0) {
          setActiveUniverse(u[0].ID_UNIVERSE);
        }

      } catch (e) {
        console.error("❌ universe load error", e);
      }
    }

    load();
  }, []);

  return (
    <UniverseContext.Provider
      value={{
        universes,
        activeUniverse,
        setActiveUniverse,
      }}
    >
      {children}
    </UniverseContext.Provider>
  );
}

export function useUniverse() {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error("UniverseContext missing");
  return ctx;
}
