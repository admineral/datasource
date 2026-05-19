"use client";

import Link from "next/link";
import { useState } from "react";
import { LINKS, ROUTES } from "./constants";

const NAV_ITEMS = [
  { href: "#about", label: "About" },
  { href: "#programme", label: "Programme" },
  { href: "#apply", label: "Apply" },
  { href: "#tracks", label: "Tracks" },
  { href: "#infrastructure", label: "Infrastructure" },
  { href: "#partners", label: "Partners" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="font-mono text-sm font-bold tracking-widest text-white">
          ZERO<span className="text-[#0055FF]">ONE</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={ROUTES.predict}
            className="border border-zinc-700 px-4 py-2 font-mono text-xs tracking-wider text-zinc-300 uppercase transition-colors hover:border-[#0055FF] hover:text-white"
          >
            Start Training
          </Link>
          <Link
            href={LINKS.logisticsForm}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-zinc-700 px-4 py-2 font-mono text-xs tracking-wider text-zinc-300 uppercase transition-colors hover:border-[#0055FF] hover:text-white"
          >
            Logistics Form
          </Link>
          <Link
            href={LINKS.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0055FF] px-4 py-2 font-mono text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#0044cc]"
          >
            Apply Now
          </Link>
        </div>

        <button
          type="button"
          className="font-mono text-xs text-zinc-400 uppercase lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-800 bg-black px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm text-zinc-300 uppercase"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ROUTES.predict}
              onClick={() => setOpen(false)}
              className="font-mono text-sm text-zinc-300 uppercase"
            >
              Start Training
            </Link>
            <Link
              href={LINKS.logisticsForm}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-[#0055FF] uppercase"
            >
              Logistics Form →
            </Link>
            <Link
              href={LINKS.apply}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0055FF] px-4 py-3 text-center font-mono text-sm font-bold text-white uppercase"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
