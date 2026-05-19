import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Zero One Hack",
  description:
    "36 hours of real model training, not prompt engineering. Vienna, May 29–31, 2026.",
  url: env.NEXT_PUBLIC_APP_URL,
  links: { github: "https://github.com/admineral/datasource" },
}
