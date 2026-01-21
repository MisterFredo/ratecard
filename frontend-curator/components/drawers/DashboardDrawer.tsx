"use client";

import { X } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
  onClose: () => void;
};

export default function DashboardDrawer({
  scopeType,
  scopeId,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER GAUCHE */}
      <aside className="relative w-full md:w-[520px] bg-white shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">
            Contexte
          </div>

          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6">
          <DashboardLayout
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </div>
      </aside>
    </div>
  );
}
