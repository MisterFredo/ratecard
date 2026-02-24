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
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">
        Introduction
      </h2>

      <textarea
        className="
          w-full
          border border-gray-200
          rounded-lg
          px-3 py-2
          text-sm
          min-h-[100px]
          resize-y
          focus:outline-none
          focus:ring-1
          focus:ring-black
        "
        value={introText}
        onChange={(e) =>
          setIntroText(e.target.value)
        }
        placeholder="Introduction de la newsletter..."
      />
    </section>
  );
}
