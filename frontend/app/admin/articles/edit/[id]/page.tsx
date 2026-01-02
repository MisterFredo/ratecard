"use client";

import Link from "next/link";
import ArticleStudio from "@/components/admin/articles/ArticleStudio";

export default function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Article Studio
        </h1>

        <Link href="/admin/articles" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* STUDIO */}
      <ArticleStudio mode="edit" articleId={params.id} />
    </div>
  );
}
