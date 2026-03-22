"use client";

import { useEffect, useState } from "react";

/* ========================================================= */

type Props = {
  children: React.ReactNode;
  onClose: () => void;
  side?: "left" | "right"; // ✅ NEW
};

/* ========================================================= */

export default function EntityDrawerLayout({
  children,
  onClose,
  side = "left", // ✅ default
}: Props) {

  const [isOpen, setIsOpen] = useState(false);

  /* =========================================================
     OPEN ANIMATION
  ========================================================= */

  useEffect(() => {
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  /* =========================================================
     CLOSE
  ========================================================= */

  function handleClose() {
    setIsOpen(false);

    setTimeout(() => {
      onClose();
    }, 250);
  }

  /* =========================================================
     DYNAMIC CLASSES
  ========================================================= */

  const positionClass =
    side === "left" ? "mr-auto" : "ml-auto";

  const translateClass =
    side === "left"
      ? isOpen
        ? "translate-x-0"
        : "-translate-x-full"
      : isOpen
        ? "translate-x-0"
        : "translate-x-full";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[90] flex">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleClose}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative ${positionClass}
          w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${translateClass}
        `}
      >
        {children}
      </aside>
    </div>
  );
}
