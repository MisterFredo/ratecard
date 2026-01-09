import PublicShell from "./PublicShell";

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

    // On transforme en items de menu
    return (json.events || []).map((e: any) => ({
      slug: e.event.home_label
        .toLowerCase()
        .replace(/\s+/g, "-"),
      label: e.event.home_label,
    }));
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEventsNav();

  return (
    <PublicShell events={events}>
      {children}
    </PublicShell>
  );
}
