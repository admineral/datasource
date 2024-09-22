import { env } from "@/env"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Datasource",
  description:
    "CSV importer built with shadcn-ui, react-dropzone, and papaparse.",
  url:
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://datasource-three.vercel.app",
  links: { github: "https://github.com/admineral/datasource" },
}
