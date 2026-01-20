import AnalysisContent from "@/components/analysis/AnalysisContent";

type Props = {
  params: {
    id: string;
  };
};

export default function AnalysisPage({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <AnalysisContent id={params.id} />
    </div>
  );
}
