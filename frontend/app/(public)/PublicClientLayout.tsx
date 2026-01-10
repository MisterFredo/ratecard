import PublicShell from "./PublicShell";
import { DrawerProvider } from "@/contexts/DrawerContext";

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

    return (json.events || []).map((e: any) => {
      const label = e.event.label;

      // URLs temporaires (en attendant le back)
      let url = "#";
      if (label.includes("Touquet")) {
        url =
          "https://events.ratecard.fr/ratecard-meetings-touquet-2026";
      } else if (label.includes("Paris")) {
        url =
          "https://events.ratecard.fr/ratecard-meetings-paris-2026";
      } else if (label.includes("Miami")) {
        url = "https://possibleevent.com/";
      }

      return {
        label,
        url,
      };
    });
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
    </DrawerProvider>
  );
}
