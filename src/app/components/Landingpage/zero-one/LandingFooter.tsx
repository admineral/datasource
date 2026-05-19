import Link from "next/link";
import { EVENT, LINKS } from "./constants";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800/80 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:px-8 md:text-left">
        <div>
          <p className="font-bold text-white">{EVENT.name}</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            {EVENT.dates} · {EVENT.location}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-mono text-xs tracking-wider uppercase">
          <Link
            href={LINKS.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            Apply
          </Link>
          <Link
            href={LINKS.logisticsForm}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            Logistics Form
          </Link>
          <Link
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            @zero.one.hack
          </Link>
          <Link
            href={LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            LinkedIn
          </Link>
        </div>
        <p className="font-mono text-[10px] text-zinc-600">
          Organized by Lumos
        </p>
      </div>
    </footer>
  );
}
