"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type {
  FeedItem,
  FeedBadge,
} from "@/types/feed";

/* ========================================================= */

const GCS_BASE_URL =
  process.env
    .NEXT_PUBLIC_GCS_BASE_URL || "";

/* ========================================================= */

type Props = {
  item: FeedItem;

  selected?: boolean;

  onToggleSelect: (
    item: FeedItem
  ) => void;

  onClickBadge?: (
    badge: FeedBadge
  ) => void;
};

/* ========================================================= */

export default function NewsCard({
  item,
  selected = false,
  onToggleSelect,
  onClickBadge,
}: Props) {

  const [open, setOpen] =
    useState(false);

  /* =========================================================
     TOPIC BADGES ONLY
  ========================================================= */

  const topicBadges =
    (item.badges || []).filter(
      (b) => b.type === "topic"
    );

  /* =========================================================
     PRIMARY COMPANY
  ========================================================= */

  const primaryCompany =
    item.companies?.find(
      (c: any) =>
        c.id_company ===
        item.id_primary_company
    ) || item.companies?.[0];

  /* =========================================================
     LOGO
  ========================================================= */

  const logoUrl =
    primaryCompany
      ?.media_logo_rectangle_id
      ? `${GCS_BASE_URL}/companies/${primaryCompany.media_logo_rectangle_id}`
      : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div
      className="
        bg-white
        border
        rounded-xl
        overflow-hidden
      "
    >

      {/* HEADER */}

      <div
        className="
          px-4
          py-4
          flex
          items-start
          gap-4
        "
      >

        {/* LEFT COLUMN */}

        <div
          className="
            flex
            flex-col
            items-center
            gap-3
            shrink-0
          "
        >

          {/* LOGO */}

          <div
            className="
              w-20
              h-20
              rounded-2xl
              border
              bg-white
              overflow-hidden
              flex
              items-center
              justify-center
            "
          >

            {logoUrl ? (

              <img
                src={logoUrl}
                alt={
                  primaryCompany?.name ||
                  ""
                }
                className="
                  w-full
                  h-full
                  object-contain
                "
              />

            ) : (

              <div
                className="
                  text-xs
                  text-gray-400
                "
              >
                —
              </div>

            )}

          </div>

          {/* SELECT */}

          <input
            type="checkbox"
            checked={selected}
            onChange={() =>
              onToggleSelect(item)
            }
            className="mt-1"
          />

        </div>

        {/* CONTENT */}

        <div className="flex-1 min-w-0">

          {/* TOP */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >

            <div className="min-w-0">

              {/* TITLE */}

              <div
                className="
                  text-2xl
                  font-semibold
                  text-gray-900
                  leading-tight
                "
              >
                {item.title}
              </div>

              {/* COMPANY */}

              <div
                className="
                  text-lg
                  text-gray-500
                  mt-2
                "
              >
                {primaryCompany?.name ||
                  "Unknown company"}
              </div>

            </div>

            {/* EXPAND */}

            <button
              onClick={() =>
                setOpen(!open)
              }
              className="
                w-8
                h-8
                rounded-lg
                border
                flex
                items-center
                justify-center
                bg-white
                shrink-0
              "
            >

              {open ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}

            </button>

          </div>

          {/* TOPICS */}

          {topicBadges.length > 0 && (

            <div
              className="
                flex
                flex-wrap
                gap-2
                mt-4
              "
            >

              {topicBadges.map(
                (badge, idx) => (

                  <button
                    key={`${badge.label}-${idx}`}
                    onClick={() =>
                      onClickBadge?.(
                        badge
                      )
                    }
                    className="
                      px-3
                      py-1.5
                      rounded-full
                      text-sm
                      bg-gray-100
                      hover:bg-gray-200
                      transition
                    "
                  >
                    {badge.label}
                  </button>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* EXPANDED */}

      {open && (

        <div
          className="
            border-t
            px-4
            py-4
            space-y-4
            bg-gray-50
          "
        >

          {/* EXCERPT */}

          {item.excerpt && (

            <div
              className="
                text-sm
                text-gray-700
                leading-6
              "
            >
              {item.excerpt}
            </div>

          )}

          {/* CONTENT */}

          {item.content_body && (

            <div
              className="
                text-sm
                text-gray-600
                leading-7
                whitespace-pre-wrap
              "
            >
              {item.content_body}
            </div>

          )}

        </div>

      )}

    </div>
  );
}
