"use client";

import { useRouter } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  event: {
    label: string;
    homeLabel?: string;
    color?: string;
  };
  topic?: string;
  keyMetric?: string;
};

export default function AnalysisCard({
  id,
  title,
  excerpt,
  publishedAt,
  event,
  topic,
  keyMetric,
}: Props) {
  const { openDrawer } = useDrawer();
  const router = useRouter();

  return (
    <article
      onClick={() => {
        router.push(`/analysis?analysis_id=${id}`, { scroll: false });
        openDrawer("analysis", id);
      }}
      className="
        cursor-pointer rounded-2xl
        border border-ratecard-border bg-white
        p-5 hover:border-gray-400 transition-colors
        flex flex-col
      "
    >
      {/* EVENT + DATE */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: event.color || "#9CA3AF" }}
          />
          <span className="font-medium">
            {event.homeLabel || event.label}
          </span>
        </div>

        <span className="text-gray-400">
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* EXCERPT */}
      {excerpt && (
        <p className="text-sm text-gray-600 mt-2">
          {excerpt}
        </p>
      )}

      {/* META */}
      <div className="mt-auto pt-4 text-xs text-gray-500 space-y-2">
        {/* KEY METRIC */}
        {keyMetric && (
          <div>
            • {keyMetric}
          </div>
        )}

        {/* TOPIC */}
        {topic && (
          <div>
            <span className="inline-block px-2 py-0.5 rounded bg-ratecard-light text-gray-600">
              {topic}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

