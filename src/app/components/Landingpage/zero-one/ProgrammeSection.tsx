import { PROGRAMME } from "./constants";
export function ProgrammeSection() {
  return (
    <section id="programme" className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="mb-10 font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
          Programme
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {PROGRAMME.map((day) => (
            <div key={day.day} className="border border-zinc-800 bg-zinc-950/40">
              <div className="border-b border-zinc-800 px-5 py-4">
                <p className="font-mono text-xs tracking-widest text-[#0055FF] uppercase">
                  {day.day}
                </p>
                <p className="text-lg font-bold text-white">{day.label}</p>
              </div>
              <ul className="divide-y divide-zinc-800/80">
                {day.events.map((event) => (
                  <li
                    key={event.title}
                    className="flex gap-4 px-5 py-3 text-sm"
                  >
                    <span className="shrink-0 font-mono text-zinc-500">
                      {event.time}
                    </span>
                    <span className="text-zinc-200">{event.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
