import Link from "next/link";
import { LINKS } from "./constants";
import { SectionHeading } from "./ui";

export function PartnerCTASection() {
  return (
    <section
      id="partner"
      className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          number="06"
          title="Become a Partner"
          subtitle="For Partners"
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-3xl font-bold text-white md:text-4xl">
              Meet the builders.
            </h3>
            <p className="mt-4 max-w-lg text-zinc-400">
              100 pre-vetted builders, 36 hours, European supercompute. Whether
              you want to partner on a track, recruit talent, or back the
              weekend, reach out and we&apos;ll reply with next steps.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: "Builders", value: "100" },
                { label: "Hours", value: "36" },
                { label: "Tracks", value: "3" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/40 p-8">
            <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Contact
            </p>
            <h4 className="mt-2 text-2xl font-bold text-white">
              Let&apos;s talk.
            </h4>
            <p className="mt-3 text-sm text-zinc-400">
              Interested in partnering or recruiting from the room? Drop a short
              message and we&apos;ll reply with next steps.
            </p>
            <Link
              href={LINKS.partnerEmail}
              className="mt-6 inline-flex bg-[#0055FF] px-6 py-3 font-mono text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#0044cc]"
            >
              partnerships@lumos-consulting.at
            </Link>
            <p className="mt-4 font-mono text-[10px] text-zinc-600 uppercase">
              Typically reply within 48 h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
