"use client";

import HtmlEditor from "@/components/admin/HtmlEditor";
import type { HeaderConfig } from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;

  introText: string;
  setIntroText: (value: string) => void;
};

export default function HeaderIntroEditor({
  headerConfig,
  setHeaderConfig,
  introText,
  setIntroText,
}: Props) {
  return (
    <div className="col-span-2 space-y-2">
      <label className="text-xs text-gray-500">
        Introduction (rich text)
      </label>

      <HtmlEditor
        value={headerConfig.introHtml || introText || ""}
        onChange={(html) => {
          setHeaderConfig((prev) => ({
            ...prev,
            introHtml: html,
          }));

          // compat legacy
          setIntroText(html);
        }}
      />
    </div>
  );
}
