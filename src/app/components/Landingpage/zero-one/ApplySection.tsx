import Link from "next/link";
import { APPLY_GLANCE, LINKS, PIPELINE } from "./constants";
import { Countdown } from "./Countdown";
import { SectionHeading } from "./ui";

const STATUS_STYLES = {
  CLOSED: "border-zinc-700 text-zinc-500",
  OPEN: "border-[#0055FF] bg-[#0055FF]/10 text-[#0055FF]",
  SOON: "border-amber-700/50 text-amber-400",
  LOCKED: "border-zinc-600 text-zinc-400",
} as const;

export function ApplySection() {
  return (
    <section id="apply" className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="02" title="Apply" subtitle="At a Glance" />

        <div className="mb-16 grid gap-8 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {APPLY_GLANCE.map((item) => (
              <div
                key={item.label}
                className="border border-zinc-800 bg-zinc-950/40 px-5 py-4"
              >
                <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  {item.label}
                </p>
                <p className="mt-1 font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Until Kickoff
            </p>
            <Countdown />
            <Link
              href={LINKS.apply}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#0055FF] py-4 font-mono text-sm font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#0044cc] sm:w-auto sm:px-10"
            >
              Apply via Luma →
            </Link>
          </div>
        </div>

        <p className="mb-6 font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Application Pipeline
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((step) => (
            <div
              key={step.step}
              className="flex flex-col border border-zinc-800 bg-zinc-950/40 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-zinc-600">
                  {step.step}
                </span>
                <span
                  className={`border px-2 py-0.5 font-mono text-[10px] tracking-wider ${STATUS_STYLES[step.status]}`}
                >
                  {step.status}
                </span>
              </div>
              <p className="font-mono text-[10px] text-zinc-500 uppercase">
                {step.period}
              </p>
              <h3 className="mt-2 font-bold text-white">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm text-zinc-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
