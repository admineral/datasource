"use client";

import { useEffect, useState } from "react";
import { EVENT } from "./constants";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center border border-zinc-800 bg-zinc-950/80 px-4 py-3 md:px-6 md:py-4">
      <span className="font-mono text-2xl font-bold tabular-nums text-white md:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
        {label}
      </span>
    </div>
  );
}

const PLACEHOLDER = { days: 0, hours: 0, minutes: 0, seconds: 0 }

export function Countdown() {
  // Defer live clock to client so SSR HTML matches the first client render
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null)

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(EVENT.kickoff))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const { days, hours, minutes, seconds } = timeLeft ?? PLACEHOLDER

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3">
      <TimeBlock value={days} label="Days" />
      <TimeBlock value={hours} label="Hours" />
      <TimeBlock value={minutes} label="Minutes" />
      <TimeBlock value={seconds} label="Seconds" />
    </div>
  )
}
