"use client";

import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  label: string;
};

export default function TopicCard({ id, label }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { openLeftDrawer } = useDrawer();

  function handleClick() {
    openLeftDrawer("topic", id);

    router.replace(
      `${pathname}?topic_id=${id}`,
      { scroll: false }
    );
  }

  return (
    <div
      onClick={handleClick}
      className="
        cursor-pointer rounded-xl
        border border-gray-200
        bg-white p-4
        text-sm font-medium text-gray-900
        hover:bg-gray-50 transition
      "
    >
      {label}
    </div>
  );
}
