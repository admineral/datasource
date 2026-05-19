"use client";

import { useState } from "react";
import { FAQ } from "./constants";
import { SectionHeading } from "./ui";

export function FAQSection() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading number="08" title="FAQ" />

        <div className="space-y-12">
          {FAQ.map((group) => (
            <div key={group.category}>
              <p className="mb-6 font-mono text-xs tracking-widest text-[#0055FF] uppercase">
                {group.category}
              </p>
              <div className="divide-y divide-zinc-800 border border-zinc-800">
                {group.items.map((item) => {
                  const key = `${group.category}-${item.q}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenKey(isOpen ? null : key)
                        }
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-900/50"
                      >
                        <span className="font-medium text-white">
                          {item.q}
                        </span>
                        <span className="shrink-0 font-mono text-[#0055FF]">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <p className="border-t border-zinc-800/50 px-5 pb-4 text-sm leading-relaxed text-zinc-400">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
