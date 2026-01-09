import NewsDrawer from "@/components/drawers/NewsDrawer";

export default function NewsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <NewsDrawer id={params.id} onClose={() => {}} />
    </div>
  );
}
