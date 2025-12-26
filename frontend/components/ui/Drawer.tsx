"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: DrawerSize;
  children: React.ReactNode;
}) {
  // ESCAPE KEY SUPPORT
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // WIDTH MAP
  const widthMap: Record<DrawerSize, string> = {
    sm: "w-[320px]",
    md: "w-[420px]",
    lg: "w-[560px]",
    xl: "w-[720px]",
    full: "w-full max-w-full",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* PANEL */}
          <motion.div
            className={`
              fixed right-0 top-0 h-full bg-white shadow-2xl z-50 
              flex flex-col 
              ${widthMap[size]}
            `}
            initial={{ x: 480 }}
            animate={{ x: 0 }}
            exit={{ x: 480 }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
          >
            {/* HEADER */}
            <div className="p-6 border-b bg-gradient-to-b from-gray-50 to-white">
              <div className="flex justify-between items-start">
                <div>
                  {title && (
                    <h2 className="text-xl font-semibold text-ratecard-blue leading-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-black transition"
                  aria-label="Fermer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto p-6 flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


