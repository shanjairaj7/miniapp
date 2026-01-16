import Nav from "./Nav";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Masthead({
  updatedAt,
  compact = false,
}: {
  updatedAt: string;
  compact?: boolean;
}) {
  return (
    <header
      className={cn(
        "rounded-[16px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm",
        compact ? "px-5 py-4" : "px-6 py-7"
      )}
    >
      <div className={cn("flex flex-col", compact ? "gap-3" : "gap-6")}> 
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            {!compact && (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Frontier Intelligence
              </p>
            )}
            <h1
              className={cn(
                "font-semibold text-[color:var(--ink)]",
                compact ? "text-2xl" : "text-4xl md:text-5xl"
              )}
            >
              Frontier Pulse
            </h1>
            {!compact && (
              <p className="mt-2 text-base text-[color:var(--muted)]">
                A living index of models and papers for builders and researchers.
              </p>
            )}
          </div>
          <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Updated {formatDate(updatedAt)}
          </div>
        </div>
        <div className="h-px w-full bg-[color:var(--border)]" />
        <Nav />
      </div>
    </header>
  );
}
