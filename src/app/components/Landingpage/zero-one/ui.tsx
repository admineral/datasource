import { cn } from "@/lib/utils";

export function SectionNumber({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-[0.3em] text-zinc-500",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TerminalLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs tracking-wider text-[#0055FF] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  number,
  title,
  subtitle,
  className,
}: {
  number: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <SectionNumber className="mb-4 block">{number}</SectionNumber>
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl font-mono text-sm text-zinc-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
