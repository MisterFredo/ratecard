"use client";

import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function FavoritesStrip({
  title = "Favoris",
  children,
}: Props) {

  return (

    <div
      className="
        sticky
        top-0
        z-50

        bg-gray-50

        border-b
        border-gray-200

        pb-4
        mb-4
      "
    >

      <div className="space-y-2">

        <h2
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-gray-500
          "
        >
          {title}
        </h2>

        {children}

      </div>

    </div>

  );
}
