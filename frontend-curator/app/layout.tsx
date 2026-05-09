import "./globals.css";

import CuratorShell from "@/components/layout/CuratorShell";

import { DrawerProvider } from "@/contexts/DrawerContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

import DrawerHost from "@/components/drawers/DrawerHost";

import AuthGuard from "@/components/auth/AuthGuard";

/* ========================================================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>

        <DrawerProvider>

          <WorkspaceProvider>

            <AuthGuard>
              <CuratorShell>
                {children}
              </CuratorShell>
            </AuthGuard>

            <DrawerHost />

          </WorkspaceProvider>

        </DrawerProvider>

      </body>
    </html>
  );
}
