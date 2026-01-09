"use client";

import { useRouter } from "next/navigation";
import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

export default function AnalysisInterceptPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  return (
    <AnalysisDrawer
      id={params.id}
      onClose={() => router.back()}
    />
  );
}
