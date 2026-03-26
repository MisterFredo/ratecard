"use client";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";

type Props = {
  header: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
};

export default function EntityDrawer({
  header,
  children,
  onClose,
}: Props) {
  return (
    <EntityDrawerLayout onClose={onClose}>
      {header}

      <div className="px-6 py-6 space-y-8">
        {children}
      </div>
    </EntityDrawerLayout>
  );
}
