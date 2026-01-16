import Nav from "./Nav";
import { formatDate } from "@/lib/utils";

export default function Masthead({
  updatedAt,
}: {
  updatedAt: string;
}) {
  return (
    <header className="border-b border-[color:var(--border)] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-mono text-2xl font-black text-[color:var(--ink)]">
            Frontier Pulse
          </h1>
          <div className="flex items-center gap-4">
            <Nav />
            <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--paper-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[color:var(--muted)]">
              {formatDate(updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
