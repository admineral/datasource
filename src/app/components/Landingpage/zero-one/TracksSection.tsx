import { TRACKS } from "./constants";
import { SectionHeading } from "./ui";

export function TracksSection() {
  return (
    <section id="tracks" className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          number="03"
          title="Tracks"
          subtitle="3 Tracks · Prize Pool €10K+"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {TRACKS.map((track) => (
            <article
              key={track.id}
              className="flex flex-col border border-zinc-800 bg-zinc-950/40"
            >
              <div className="border-b border-zinc-800 p-6">
                <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  Track {track.id} · {track.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {track.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {track.description}
                </p>
                <p className="mt-3 font-mono text-xs text-[#0055FF]">
                  {track.focus}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    Partner
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {track.partner}
                  </p>
                </div>
                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <p className="mb-3 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                    Prizes · €3,500 / Track
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-mono text-[10px] text-zinc-500">
                        1st
                      </p>
                      <p className="font-bold text-white">{track.prizes.first}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-500">
                        2nd
                      </p>
                      <p className="font-bold text-white">
                        {track.prizes.second}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-zinc-500">
                        3rd
                      </p>
                      <p className="font-bold text-white">{track.prizes.third}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
