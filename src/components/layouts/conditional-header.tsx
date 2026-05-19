"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layouts/site-header";

export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <SiteHeader />;
}
