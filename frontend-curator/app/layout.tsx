import "./globals.css";

import CuratorShell from "@/components/layout/CuratorShell";
import { DrawerProvider } from "@/contexts/DrawerContext";
import DrawerHost from "@/components/drawers/DrawerHost";
import AuthGuard from "@/components/auth/AuthGuard"; // 👈 AJOUT

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <DrawerProvider>

          <AuthGuard> {/* 🔥 ICI */}
            <CuratorShell>{children}</CuratorShell>
          </AuthGuard>

          <DrawerHost />
        </DrawerProvider>
      </body>
    </html>
  );
}
