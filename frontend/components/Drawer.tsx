"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Drawer({ open, onClose, children }: Props) {
  // ---------------------------------------------------------
  // ESC pour fermer
  // ---------------------------------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="absolute inset-0 bg-white overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Ratecard
            </span>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
