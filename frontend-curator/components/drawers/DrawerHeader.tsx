"use client";

import { X } from "lucide-react";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* ========================================================= */

type Props = {
  title: string;
  subtitle?: string;

  logoId?: string | null;
  logoType?: "company" | "solution";

  variant?: "company" | "solution" | "topic";

  nbAnalyses?: number;
  delta30d?: number;

  onClose: () => void;
};

/* ========================================================= */

export default function DrawerHeader({
  title,
  subtitle,
  logoId,
  logoType,
  variant = "topic",
  nbAnalyses,
  delta30d,
  onClose,
}: Props) {

  // =====================================================
  // 🔥 LOGO URL (SAFE + DYNAMIQUE)
  // =====================================================
  let logoUrl: string | null = null;

  if (logoId) {
    const folder =
      logoType === "solution"
        ? "solutions"
        : "companies"; // fallback

    logoUrl = `${GCS_BASE_URL}/${folder}/${logoId}`;
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 space-y-3">

      {/* =====================================================
          TOP ROW
      ===================================================== */}
      <div className="flex items-start justify-between">

        <div className="space-y-1">

          {/* TITLE */}
          <h1 className="text-xl font-semibold text-gray-900">
            {title}
          </h1>

          {/* =====================================================
              SUBTITLE / COMPANY / AXIS
          ===================================================== */}
          {subtitle && (
            <div className="flex items-center gap-2 text-sm text-gray-500">

              {/* 🔥 LOGO */}
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={subtitle}
                  className="h-5 object-contain"
                />
              )}

              <span>{subtitle}</span>
            </div>
          )}
        </div>

        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}
      {(nbAnalyses !== undefined || delta30d !== undefined) && (
        <div className="flex gap-4 text-xs text-gray-500">

          {typeof nbAnalyses === "number" && (
            <span>{nbAnalyses} analyses</span>
          )}

          {typeof delta30d === "number" && (
            <span className="text-teal-600">
              +{delta30d} (30j)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
