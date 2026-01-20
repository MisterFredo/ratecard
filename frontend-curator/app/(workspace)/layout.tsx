import { DrawerProvider } from "@/contexts/DrawerContext";
import WorkspaceShell from "./WorkspaceShell";

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
    </DrawerProvider>
  );
}
