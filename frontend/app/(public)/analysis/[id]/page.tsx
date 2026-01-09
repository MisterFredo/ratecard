import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";

export default function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <AnalysisDrawer id={params.id} />
    </div>
  );
}
