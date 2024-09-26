import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Datasource",
  description:
    "Dashboard for your data",
  url:
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://datasource-three.vercel.app",
  links: { github: "https://github.com/admineral/datasource" },
}
