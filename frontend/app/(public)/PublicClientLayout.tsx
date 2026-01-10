"use client";

import { DrawerProvider } from "@/contexts/DrawerContext";
import GlobalDrawer from "@/components/drawers/GlobalDrawer";
import PublicShell from "./PublicShell";

type Props = {
  children: React.ReactNode;
  events: { slug: string; label: string }[];
};

export default function PublicClientLayout({
  children,
  events,
}: Props) {
  return (
    <DrawerProvider>
      <PublicShell events={events}>
        {children}
      </PublicShell>

      {/* DRAWER GLOBAL (ADEX-LIKE) */}
      <GlobalDrawer />
    </DrawerProvider>
  );
}
