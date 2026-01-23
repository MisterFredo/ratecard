"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AnalysisContent from "@/components/analysis/AnalysisContent";

type Props = {
  id: string;
  onClose: () => void;
};

/**
 * Drawer de lecture d'analyse (Curator)
 * ⚠️ Ne gère QUE les analyses, pas les sources (news)
 */
export default function AnalysisDrawer({ id, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------------------------------------------------
     OPEN ANIMATION
  --------------------------------------------------------- */
  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, [id]);

  if (!id) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Analyse
          </h2>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6">
          {/* 🔑 key force le remount quand on change d'analyse */}
          <AnalysisContent key={id} id={id} />
        </div>
      </aside>
    </div>
  );
}
