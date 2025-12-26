"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export default function Drawer({
  open,
  onClose,
  title,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: DrawerSize;
  children: React.ReactNode;
}) {
  // Escape key support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Width mapping
  const widthMap = {
    sm: "w-[320px]",
    md: "w-[420px]",
    lg: "w-[560px]",
    xl: "w-[720px]",
    full: "w-full",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto ${widthMap[size]}`}
            initial={{ x: 600 }}
            animate={{ x: 0 }}
            exit={{ x: 600 }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-ratecard-blue">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            {/* CONTENT */}
            <div>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

