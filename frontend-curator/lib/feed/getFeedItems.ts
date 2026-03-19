export async function getFeedItems({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const offset = (page - 1) * pageSize;

  const res = await fetch(
    `/api/curator/feed?limit=${pageSize}&offset=${offset}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch feed");
  }

  const data = await res.json();

  return {
    items: data.items || [],
    total: data.total || 0,
  };
}
