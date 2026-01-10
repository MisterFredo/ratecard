"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import NewsDrawer from "@/components/drawers/NewsDrawer";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

export default function GlobalDrawer() {
  const { drawer, closeDrawer } = useDrawer();

  if (!drawer.type || !drawer.id) return null;

  return (
    <>
      {drawer.type === "news" && (
        <NewsDrawer id={drawer.id} onClose={closeDrawer} />
      )}

      {drawer.type === "analysis" && (
        <AnalysisDrawer
          id={drawer.id}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
