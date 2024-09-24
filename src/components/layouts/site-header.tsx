import Link from "next/link"
import { FileIcon, GitHubLogoIcon, ChatBubbleIcon, RocketIcon, TableIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/layouts/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-2 flex items-center md:mr-6 md:space-x-2">
          <FileIcon className="size-4" aria-hidden="true" />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4 md:justify-start">
          <Link href="/ChatSelect" className="flex items-center space-x-2 text-sm font-medium">
            <ChatBubbleIcon className="size-4" />
            <span>Chat</span>
          </Link>
          <Link href="/Predict" className="flex items-center space-x-2 text-sm font-medium">
            <RocketIcon className="size-4" />
            <span>Predict</span>
          </Link>
          <Link href="/Importer" className="flex items-center space-x-2 text-sm font-medium">
            <TableIcon className="size-4" />
            <span>Data</span>
          </Link>
        </nav>
        <nav className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link
              aria-label="GitHub repo"
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubLogoIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}