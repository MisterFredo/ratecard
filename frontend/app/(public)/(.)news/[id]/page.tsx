"use client";

import NewsDrawer from "@/components/drawers/NewsDrawer";

export default function NewsInterceptPage({
  params,
}: {
  params: { id: string };
}) {
  return <NewsDrawer id={params.id} />;
}
