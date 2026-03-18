"use client";

type Props = {
  label: string;
  type?: "SELECTION" | "SOCIETE" | "SOLUTION";
  clickable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export default function BadgeLabel({
  label,
  type = "SELECTION",
  clickable = false,
  onClick,
}: Props) {
  const base =
    "text-xs px-2 py-0.5 rounded-full border transition";

  const styles = {
    SELECTION:
      "bg-blue-50 text-blue-700 border-blue-200",
    SOCIETE:
      "bg-purple-50 text-purple-700 border-purple-200",
    SOLUTION:
      "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <span
      onClick={clickable ? onClick : undefined}
      className={`
        ${base}
        ${styles[type]}
        ${clickable ? "cursor-pointer hover:opacity-80" : ""}
      `}
    >
      {label}
    </span>
  );
}
