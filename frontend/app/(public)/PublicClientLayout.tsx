import PublicShell from "./PublicShell";
import { DrawerProvider } from "@/contexts/DrawerContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getEventsNav() {
  try {
    const res = await fetch(
      `${API_BASE}/public/nav/events`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];

    const json = await res.json();
    return json.events || [];
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
      {/* DrawerHost est monté dans app/(public)/layout.tsx */}
    </DrawerProvider>
  );
}
