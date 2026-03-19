import "./globals.css";

import CuratorShell from "@/components/layout/CuratorShell";
import { DrawerProvider } from "@/contexts/DrawerContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <DrawerProvider>
          <CuratorShell>{children}</CuratorShell>
        </DrawerProvider>
      </body>
    </html>
  );
}
