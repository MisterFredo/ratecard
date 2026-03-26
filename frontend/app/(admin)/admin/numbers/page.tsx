"use client";

import { useState } from "react";

import NumbersManualCreate from "@/components/admin/numbers/NumbersManualCreate";
import NumbersRawPanel from "@/components/admin/numbers/NumbersRawPanel";

/* ========================================================= */

export default function NumbersPage() {

  const [tab, setTab] = useState<"manual" | "content">("manual");

  /* ========================================================= */

  return (

    <div className="space-y-6">

      {/* =========================================================
         HEADER
      ========================================================= */}

      <h1 className="text-2xl font-semibold text-ratecard-blue">
        Numbers
      </h1>

      {/* =========================================================
         TABS
      ========================================================= */}

      <div className="flex gap-4">

        <button
          onClick={() => setTab("manual")}
          className={`px-3 py-1 rounded ${
            tab === "manual"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Manual
        </button>

        <button
          onClick={() => setTab("content")}
          className={`px-3 py-1 rounded ${
            tab === "content"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          From Content
        </button>

      </div>

      {/* =========================================================
         MANUAL CREATE
      ========================================================= */}

      {tab === "manual" && (
        <NumbersManualCreate />
      )}

      {/* =========================================================
         GUIDED (FROM CONTENT)
      ========================================================= */}

      {tab === "content" && (
        <NumbersRawPanel />
      )}

    </div>
  );
}
