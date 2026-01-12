"use client";

import Link from "next/link";
import SynthesisStudio from "@/components/admin/synthesis/SynthesisStudio";

export default function EditSynthesisPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Synthesis Studio
        </h1>

        <Link
          href="/admin/synthesis"
          className="underline text-gray-600"
        >
          ← Retour
        </Link>
      </div>

      {/* STUDIO */}
      <SynthesisStudio mode="edit" synthesisId={params.id} />
    </div>
  );
}
