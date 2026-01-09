export const dynamic = "force-dynamic";

import HomeClient from "./HomeClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* fetch helpers + loaders identiques à avant */

export default async function Home() {
  const [continuous, news, events] = await Promise.all([
    getContinuous(),
    getHomeNews(),
    getHomeEvents(),
  ]);

  return (
    <HomeClient
      continuous={continuous}
      news={news}
      events={events}
    />
  );
}
