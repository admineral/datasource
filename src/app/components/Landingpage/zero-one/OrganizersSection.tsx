import { SectionHeading } from "./ui";

export function OrganizersSection() {
  return (
    <section className="border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="07" title="Organizers" subtitle="Organized by" />

        <div className="max-w-2xl border border-zinc-800 bg-zinc-950/40 p-8 md:p-10">
          <h3 className="text-3xl font-bold text-[#0055FF]">Lumos</h3>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Vienna&apos;s leading student organization in Data Science & AI.
            Bringing together students from TU Wien, WU, and Uni Wien since 2019
            to learn, build, and collaborate with industry.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6">
            {[
              { label: "Active Members", value: "30+" },
              { label: "Alumni", value: "130+" },
              { label: "Founded", value: "2019" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
