import { ReactNode } from "react";

export default function ChartCard({
  title,
  description,
  icon,
  children,
  gradient = "from-slate-50 to-slate-100/30",
}: {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
  gradient?: string;
}) {
  return (
    <div className={`rounded-[16px] border border-[color:var(--border)] bg-gradient-to-br ${gradient} p-6 shadow-sm`}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="text-lg font-bold text-[color:var(--ink)]">{title}</h3>
              <p className="text-sm text-[color:var(--muted)]">{description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[300px]">{children}</div>
    </div>
  );
}
