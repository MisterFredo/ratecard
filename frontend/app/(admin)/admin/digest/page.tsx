// app/(admin)/admin/digest/page.tsx

"use client";

import { useState } from "react";

import DeliveryHeaderConfig from "@/components/delivery/core/DeliveryHeaderConfig";

import DigestSelectors from "@/components/digest/DigestSelectors";

import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";

import DigestPreviewPanel from "@/components/digest/delivery/DigestPreviewPanel";

import type {
  DigestContentItem,
  DigestNumberItem,
  DigestEditorialItem,
} from "@/types/digest";

import type {
  HeaderConfig,
} from "@/types/newsletter";

/* ========================================================= */

export default function DigestPage() {

  /* =======================================================
     HEADER
  ======================================================= */

  const [
    headerConfig,
    setHeaderConfig,
  ] = useState<HeaderConfig>({
    title: "Digest Curator",

    subtitle: "",

    period: "",

    headerCompany:
      undefined,

    topBarEnabled:
      true,

    topBarColor:
      "#111827",

    periodColor:
      "#111827",

    introHtml: "",
  });

  const [
    introText,
    setIntroText,
  ] = useState("");

  /* =======================================================
     DIGEST DATA
  ======================================================= */

  const [
    contents,
  ] = useState<
    DigestContentItem[]
  >([]);

  const [
    numbers,
  ] = useState<
    DigestNumberItem[]
  >([]);

  /* =======================================================
     FLOW
  ======================================================= */

  const [
    editorialOrder,
    setEditorialOrder,
  ] = useState<
    DigestEditorialItem[]
  >([]);

  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="space-y-4">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <h1 className="text-lg font-semibold tracking-tight">
          Digest
        </h1>

      </div>

      {/* LAYOUT */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.3fr] gap-6 items-start">

        {/* LEFT */}

        <div className="space-y-5">

          <DeliveryHeaderConfig
            headerConfig={
              headerConfig
            }

            setHeaderConfig={
              setHeaderConfig
            }

            introText={
              introText
            }

            setIntroText={
              setIntroText
            }
          />

          <DigestSelectors
            contents={
              contents
            }

            numbers={
              numbers
            }

            editorialOrder={
              editorialOrder
            }

            setEditorialOrder={
              setEditorialOrder
            }
          />

          <DigestEditorialFlow
            contents={
              contents
            }

            numbers={
              numbers
            }

            editorialOrder={
              editorialOrder
            }

            setEditorialOrder={
              setEditorialOrder
            }
          />

        </div>

        {/* RIGHT */}

        <div className="sticky top-6 h-[calc(100vh-4rem)] overflow-y-auto pr-2">

          <DigestPreviewPanel
            headerConfig={
              headerConfig
            }

            editorialHtml={
              introText
            }

            contents={
              contents
            }

            numbers={
              numbers
            }
          />

        </div>

      </div>

    </div>
  );
}
