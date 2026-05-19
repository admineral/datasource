import Link from "next/link";
import { EVENT, LINKS, ROUTES } from "./constants";
import { PartnerMarquee } from "./PartnerMarquee";
import { TerminalLabel } from "./ui";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] pt-12 pb-8 md:pt-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#0055FF]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="font-bold leading-none tracking-tight">
            <span className="block text-4xl text-white md:text-5xl lg:text-6xl">
              ZERO
            </span>
            <span className="block text-4xl text-white md:text-5xl lg:text-6xl">
              ONE
            </span>
            <span className="block text-4xl text-white md:text-5xl lg:text-6xl">
              HACK
            </span>
          </div>
          <div className="font-mono text-sm font-bold tracking-wider text-zinc-400 md:text-right md:text-base">
            <span className="block text-white">MAY 29 – 31</span>
            <span className="block">VIENNA</span>
          </div>
        </div>

        <TerminalLabel className="mb-6">
          &quot;GPU_ACCESS: UNLOCKED&quot;
        </TerminalLabel>

        <h1 className="mb-6 max-w-4xl text-4xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-white">36 hours of real model training,</span>{" "}
          <span className="text-[#0055FF]">not prompt engineering.</span>
        </h1>

        <p className="mb-10 max-w-xl font-mono text-sm text-zinc-400">
          {EVENT.dates} · {EVENT.location} · {EVENT.venue}
        </p>

        <div className="mb-16 flex flex-wrap gap-4">
          <Link
            href={LINKS.apply}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0055FF] px-8 py-4 font-mono text-sm font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#0044cc]"
          >
            Apply Now
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={ROUTES.predict}
            className="inline-flex items-center gap-2 border border-zinc-700 px-8 py-4 font-mono text-sm tracking-wider text-white uppercase transition-colors hover:border-[#0055FF] hover:text-[#0055FF]"
          >
            Start Training
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="#partner"
            className="inline-flex items-center gap-2 border border-zinc-700 px-8 py-4 font-mono text-sm tracking-wider text-white uppercase transition-colors hover:border-zinc-500"
          >
            Become a Partner
          </Link>
        </div>
      </div>

      <PartnerMarquee />
    </section>
  );
}
