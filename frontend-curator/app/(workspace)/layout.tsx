import { DrawerProvider } from "@/contexts/DrawerContext";
import WorkspaceShell from "./WorkspaceShell";
import DrawerHost from "@/components/drawers/DrawerHost";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <WorkspaceShell>
        {children}
      </WorkspaceShell>

      {/* Drawer global Curator */}
      <DrawerHost />
    </DrawerProvider>
  );
}

