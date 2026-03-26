"use client";

import { useState } from "react";

import NumbersManualCreate from "@/components/admin/numbers/NumbersManualCreate";
import NumbersAssistantCreate from "@/components/admin/numbers/NumbersAssistantCreate";

/* ========================================================= */

export default function NumbersPage() {

  const [tab, setTab] = useState<"manual" | "assistant">("manual");

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
          onClick={() => setTab("assistant")}
          className={`px-3 py-1 rounded ${
            tab === "assistant"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Assistant
        </button>

      </div>

      {/* =========================================================
         MANUAL
      ========================================================= */}

      {tab === "manual" && (
        <NumbersManualCreate />
      )}

      {/* =========================================================
         ASSISTANT (FROM CONTENT)
      ========================================================= */}

      {tab === "assistant" && (
        <NumbersAssistantCreate />
      )}

    </div>
  );
}
