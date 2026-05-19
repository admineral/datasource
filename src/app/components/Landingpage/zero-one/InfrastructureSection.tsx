import Link from "next/link";
import { EVENT, LINKS } from "./constants";
import { SectionHeading } from "./ui";

const VENUE_FEATURES = [
  {
    num: "01",
    title: "Dedicated Working Spaces",
    description:
      "Team desks, power, whiteboards, and private rooms for deep work.",
  },
  {
    num: "02",
    title: "Breakfast · Lunch · Dinner",
    description:
      "Three full meals a day on-site. No off-site runs, no wasted hours.",
  },
  {
    num: "03",
    title: "Sleep On-Site",
    description:
      "Dedicated sleeping area for when the model needs longer to train.",
  },
] as const;

export function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="04" title="Infrastructure" />

        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="border border-zinc-800 bg-zinc-950/40 p-8">
            <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              Computing Infrastructure · Compute
            </p>
            <h3 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              Leonardo
              <span className="block text-[#0055FF]">Supercomputer</span>
            </h3>
            <p className="mt-2 font-mono text-sm text-zinc-400">
              via AI:AT · 64 × NVIDIA A100
            </p>
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">
              Train, fine-tune, and serve real models at cluster scale. 6 nodes,
              64 NVIDIA A100 GPUs, ~4 TB aggregate VRAM. No shared queue, no
              lottery. Your team gets dedicated GPU time across the weekend.
            </p>
            <p className="mt-4 font-mono text-xs text-[#0055FF]">
              Allocation · Scheduled access · per team
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/40 p-8">
            <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              The Venue
            </p>
            <h3 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              AI:AT
              <span className="block text-[#0055FF]">Factory</span>
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Austria&apos;s new AI hub in the 3rd district of Vienna.
            </p>
            <ul className="mt-8 space-y-6">
              {VENUE_FEATURES.map((feature) => (
                <li key={feature.num} className="flex gap-4">
                  <span className="font-mono text-sm text-[#0055FF]">
                    {feature.num}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{feature.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href={LINKS.maps}
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-zinc-800 bg-zinc-950/60 p-6 transition-colors hover:border-[#0055FF]/50 md:p-8"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                Vienna · 3rd District · 48.1877° N · 16.4092° E
              </p>
              <p className="mt-2 text-2xl font-bold text-white">AI Factory</p>
              <p className="font-mono text-sm text-[#0055FF]">AI:AT</p>
              <p className="mt-2 font-mono text-sm text-zinc-400">
                {EVENT.address}
              </p>
            </div>
            <span className="font-mono text-sm text-zinc-400 transition-colors group-hover:text-[#0055FF]">
              Open in Maps →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
