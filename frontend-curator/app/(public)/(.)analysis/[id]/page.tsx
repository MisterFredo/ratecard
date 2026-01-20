"use client";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

export default function AnalysisInterceptPage({
  params,
}: {
  params: { id: string };
}) {
  return <AnalysisDrawer id={params.id} />;
}
