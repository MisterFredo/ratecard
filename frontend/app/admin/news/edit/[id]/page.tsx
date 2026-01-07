"use client";

import Link from "next/link";
import NewsStudio from "@/components/admin/news/NewsStudio";

export default function EditNewsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          News Studio
        </h1>

        <Link
          href="/admin/news"
          className="underline text-gray-600"
        >
          ← Retour
        </Link>
      </div>

      {/* STUDIO */}
      <NewsStudio mode="edit" newsId={params.id} />
    </div>
  );
}
