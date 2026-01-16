import PublicClientLayout from "./PublicClientLayout";
import DrawerHost from "@/components/drawers/DrawerHost";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicClientLayout>
      {children}

      {/* HOST CENTRAL DES DRAWERS (NEWS / ANALYSIS / MEMBER) */}
      <DrawerHost />
    </PublicClientLayout>
  );
}

