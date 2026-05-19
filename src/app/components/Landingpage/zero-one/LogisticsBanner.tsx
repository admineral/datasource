import Link from "next/link";
import { EVENT, LINKS } from "./constants";

export function LogisticsBanner() {
  return (
    <section className="border-y border-[#0055FF]/30 bg-[#0055FF]/10">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
        <p className="font-mono text-xs tracking-wider text-[#0055FF] uppercase">
          You&apos;re in!
        </p>
        <p className="mt-1 text-lg font-semibold text-white md:text-xl">
          Fill out the 3-minute logistics form by {EVENT.logisticsDeadline}
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Team setup, track preferences, dietary needs — every team member fills
          it out individually. Tag{" "}
          <Link
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0055FF] hover:underline"
          >
            @zero.one.hack
          </Link>{" "}
          to share you&apos;re in (€50 API credit raffle).
        </p>
      </div>
    </section>
  );
}
