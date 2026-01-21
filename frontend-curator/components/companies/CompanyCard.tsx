"use client";

type Props = {
  label: string;
  onClick: () => void;
};

export default function CompanyCard({ label, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        rounded-xl
        border
        bg-white
        p-5
        transition
        hover:shadow-md
        hover:border-gray-300
      "
    >
      {/* =====================================================
          TITLE
      ===================================================== */}
      <h3 className="text-lg font-semibold">
        {label}
      </h3>

      {/* =====================================================
          META (PLACEHOLDER)
      ===================================================== */}
      <p className="text-sm text-gray-500 mt-2">
        Voir les analyses liées à cette société
      </p>
    </div>
  );
}
