import PublicTopNavShell from "./PublicTopNavShell";
import { DrawerProvider } from "@/contexts/DrawerContext";

export default async function PublicClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <PublicTopNavShell>
        {children}
      </PublicTopNavShell>
      {/* DrawerHost est monté dans app/(public)/layout.tsx */}
    </DrawerProvider>
  );
}
