const GROUPS = [
  {
    title: "Speakers",
    description:
      "Industry leaders and AI practitioners sharing insights during the opening, panel, and closing ceremonies.",
  },
  {
    title: "Mentors",
    description:
      "Experienced founders and engineers available throughout the hackathon to help teams with technical and strategic challenges.",
  },
  {
    title: "Jury",
    description:
      "A panel of experts from industry, academia, and startups evaluating final pitches on technical complexity, innovation, impact, and execution.",
  },
] as const;

export function PeopleSection() {
  return (
    <section className="border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-10 font-mono text-xs tracking-widest text-zinc-500 uppercase">
          Speakers · Mentors · Jury
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {GROUPS.map((group) => (
            <div
              key={group.title}
              className="border border-zinc-800 bg-zinc-950/40 p-6"
            >
              <h3 className="text-xl font-bold text-white">{group.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {group.description}
              </p>
              <div className="mt-6 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex h-14 w-14 items-center justify-center border border-dashed border-zinc-700 font-mono text-lg text-zinc-600"
                  >
                    ?
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-xs tracking-wider text-zinc-600 uppercase">
                TBA
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
