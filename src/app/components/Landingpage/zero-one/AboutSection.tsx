import { STATS, THESIS } from "./constants";
import { SectionHeading } from "./ui";

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="01" title="About the Hack" />

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border border-zinc-800 bg-zinc-950/50 p-6 md:p-8"
            >
              <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-bold text-white md:text-5xl">
                {stat.value}
                <span className="text-[#0055FF]">{stat.suffix}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-zinc-800 bg-zinc-950/80 p-6 font-mono text-sm md:p-8">
          <p className="mb-4 text-xs tracking-widest text-zinc-500 uppercase">
            Thesis · zero-one-hack.md
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-red-400/80">--- a/normal-ai-hackathon.md</p>
              <ul className="space-y-2">
                {THESIS.removed.map((line, i) => (
                  <li key={line} className="text-red-400/70">
                    <span className="mr-2 text-zinc-600">{i + 1}</span>
                    <span className="line-through">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[#0055FF]/80">+++ b/zero-one-hack.md</p>
              <ul className="space-y-2">
                {THESIS.added.map((line, i) => (
                  <li key={line} className="text-[#0055FF]">
                    <span className="mr-2 text-zinc-600">{i + 1}</span>
                    +{line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
