import "./globals.css";

import CuratorShell from "@/components/layout/CuratorShell";
import { DrawerProvider } from "@/contexts/DrawerContext";
import DrawerHost from "@/components/drawers/DrawerHost";
import { UniverseProvider } from "@/contexts/UniverseContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>

        <UniverseProvider>
          <DrawerProvider>
            <CuratorShell>{children}</CuratorShell>

            {/* 🔥 DRAWERS */}
            <DrawerHost />
          </DrawerProvider>
        </UniverseProvider>

      </body>
    </html>
  );
}
