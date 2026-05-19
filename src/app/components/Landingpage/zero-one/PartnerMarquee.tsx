import { MARQUEE_PARTNERS } from "./constants";

export function PartnerMarquee() {
  const items = [...MARQUEE_PARTNERS, ...MARQUEE_PARTNERS];

  return (
    <div className="relative overflow-hidden border-y border-zinc-800/80 py-6">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {items.map((partner, i) => (
          <span
            key={`${partner}-${i}`}
            className="font-mono text-sm tracking-[0.2em] text-zinc-500 uppercase"
          >
            {partner}
          </span>
        ))}
      </div>
    </div>
  );
}
