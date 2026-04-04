import type { HeaderConfig } from "@/types/newsletter";

import { EmailHeaderMedia } from "./EmailHeaderMedia";
import { EmailHeaderConsulting } from "./EmailHeaderConsulting";

export function EmailHeader(
  headerConfig: HeaderConfig,
  introText?: string
) {
  switch (headerConfig.variant) {
    case "consulting":
      return EmailHeaderConsulting(headerConfig, introText);

    case "media":
    default:
      return EmailHeaderMedia(headerConfig, introText);
  }
}
