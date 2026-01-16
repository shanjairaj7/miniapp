import Link from "next/link";
import type { HFModelDetail } from "@/lib/hf";
import { extractLicense, getProviderCount } from "@/lib/signals";
import { Badge } from "@/components/ui/badge";

export default function DeployabilityList({ models }: { models: HFModelDetail[] }) {
  if (models.length === 0) {
    return <p className="text-sm text-[color:var(--muted)]">No deployable signals available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {models.map((model) => {
        const providerCount = getProviderCount(model);
        const license = extractLicense(model.tags ?? []).license;
        const safetensors = model.safetensors?.total ?? 0;
        const gguf = model.gguf?.total ?? 0;
        return (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="flex items-center justify-between rounded-[12px] border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 text-sm transition hover:border-[color:var(--accent)]"
          >
            <div>
              <p className="text-sm font-semibold text-[color:var(--ink)]">{model.id}</p>
              <p className="text-xs text-[color:var(--muted)]">
                Providers {providerCount} · {license ?? "unknown"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {providerCount > 0 && <Badge variant="secondary">API</Badge>}
              {safetensors > 0 && <Badge variant="secondary">Safetensors</Badge>}
              {gguf > 0 && <Badge variant="secondary">GGUF</Badge>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
