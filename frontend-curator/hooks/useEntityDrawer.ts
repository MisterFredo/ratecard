"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type EntityType = "topic" | "company" | "solution";

export function useEntityDrawer(
  entityType: EntityType,
  queryKey: string // "topic_id", "company_id", etc.
) {
  const searchParams = useSearchParams();
  const { openLeftDrawer, setOnLeftClose } = useDrawer();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const lastOpenedId = useRef<string | null>(null);

  /* ---------------------------------------------------------
     OPEN DRAWER FROM URL
  --------------------------------------------------------- */
  useEffect(() => {
    const id = searchParams.get(queryKey);

    if (!id) {
      lastOpenedId.current = null;
      return;
    }

    if (lastOpenedId.current === id) return;

    lastOpenedId.current = id;
    openLeftDrawer(entityType, id);
  }, [searchParams, openLeftDrawer, entityType, queryKey]);

  /* ---------------------------------------------------------
     RESET LOADER ON URL CHANGE
  --------------------------------------------------------- */
  useEffect(() => {
    const id = searchParams.get(queryKey);

    if (!id) {
      setLoadingId(null);
      return;
    }

    if (loadingId && id !== loadingId) {
      setLoadingId(null);
    }
  }, [searchParams]);

  /* ---------------------------------------------------------
     RESET LOADER ON DRAWER CLOSE
  --------------------------------------------------------- */
  useEffect(() => {
    setOnLeftClose(() => {
      setLoadingId(null);
    });

    return () => setOnLeftClose(null);
  }, []);

  return {
    loadingId,
    setLoadingId,
  };
}
