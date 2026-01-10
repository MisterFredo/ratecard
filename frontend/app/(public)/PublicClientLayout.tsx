import PublicShell from "./PublicShell";
import { DrawerProvider } from "@/contexts/DrawerContext";
import GlobalDrawer from "@/components/drawers/GlobalDrawer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getEventsNav() {
  try {
    const res = await fetch(
      `${API_BASE}/public/home/events`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];

    const json = await res.json();

    return (json.events || [])
      .filter((e: any) => e.external_url)
      .map((e: any) => ({
        label: e.label,
        url: e.external_url,
      }));
  } catch {
    return [];
  }
}

export default async function PublicClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEventsNav();

  return (
    <DrawerProvider>
      <PublicShell events={events}>
        {children}
      </PublicShell>

      {/* 🔑 DRAWERS */}
      <GlobalDrawer />
    </DrawerProvider>
  );
}
