"use client";

import { useEffect, useState } from "react";

/* ========================================================= */

type Props = {
  children: React.ReactNode;
  onClose: () => void;
};

/* ========================================================= */

export default function EntityDrawerLayout({
  children,
  onClose,
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

    // délai pour animation
    setTimeout(() => {
      onClose();
    }, 250);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[90] flex">

      {/* =====================================================
          OVERLAY
      ===================================================== */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleClose}
      />

      {/* =====================================================
          DRAWER
      ===================================================== */}
      <aside
        className={`
          relative mr-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {children}
      </aside>
    </div>
  );
}
