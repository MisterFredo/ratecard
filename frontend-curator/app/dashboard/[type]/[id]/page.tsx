"use client";

import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

type Props = {
  params: {
    type: "topic" | "company";
    id: string;
  };
};

export default function DashboardPage({ params }: Props) {
  const { type, id } = params;

  if (type !== "topic" && type !== "company") {
    notFound();
  }

  return (
    <DashboardLayout
      scopeType={type}
      scopeId={id}
    />
  );
}
