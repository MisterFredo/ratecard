"use client";

type Props = {
  introText: string;
  setIntroText: (value: string) => void;
};

export default function DigestIntroBlock({
  introText,
  setIntroText,
}: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">
        Introduction
      </h2>

      <textarea
        className="w-full border rounded p-3 min-h-[120px]"
        value={introText}
        onChange={(e) =>
          setIntroText(e.target.value)
        }
        placeholder="Introduction de la newsletter..."
      />
    </div>
  );
}
