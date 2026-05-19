import { PARTNER_TIERS, TRACKS } from "./constants";
import { SectionHeading } from "./ui";

export function PartnersSection() {
  return (
    <section
      id="partners"
      className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="05" title="Partners" />

        <p className="mb-6 font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Main · Track Partners
        </p>
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {TRACKS.map((track) => (
            <div
              key={track.id}
              className="border border-zinc-800 bg-zinc-950/40 p-6 text-center"
            >
              <p className="text-2xl font-bold text-white">{track.partner}</p>
              <p className="mt-2 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                Track {track.id} · {track.title}
              </p>
            </div>
          ))}
        </div>

        <p className="mb-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Community & Compute Partners
        </p>
        <div className="mb-12 flex flex-wrap gap-3">
          {PARTNER_TIERS.community.map((name) => (
            <span
              key={name}
              className="border border-zinc-800 px-4 py-2 font-mono text-xs tracking-wider text-zinc-300 uppercase"
            >
              {name}
            </span>
          ))}
        </div>

        <p className="mb-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Side · Food · Drinks
        </p>
        <div className="flex flex-wrap gap-3">
          {PARTNER_TIERS.side.map((name) => (
            <span
              key={name}
              className="border border-zinc-800/60 px-4 py-2 font-mono text-xs tracking-wider text-zinc-500 uppercase"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
