"use client";

import { useRouter } from "next/navigation";
import NewsDrawer from "@/components/drawers/NewsDrawer";

export default function NewsInterceptPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  return (
    <NewsDrawer
      id={params.id}
      onClose={() => router.back()}
    />
  );
}
