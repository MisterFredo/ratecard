"use client";

import Link from "next/link";
import ContentStudio from "@/components/admin/content/ContentStudio";

export default function CreateContentPage() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Content Studio
        </h1>

        <Link href="/admin/content" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* STUDIO */}
      <ContentStudio mode="create" />
    </div>
  );
}
