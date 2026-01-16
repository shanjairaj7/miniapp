import { NextResponse } from "next/server";
import { getNewModels, getTrendingModels } from "@/lib/hf";
import { saveSnapshot } from "@/lib/history";

export async function GET(request: Request) {
  const secret = process.env.SNAPSHOT_SECRET;
  if (secret) {
    const url = new URL(request.url);
    const token = url.searchParams.get("secret");
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [trending, newest] = await Promise.all([getTrendingModels(200), getNewModels(200)]);
  const merged = new Map<string, (typeof trending)[number]>();
  [...trending, ...newest].forEach((model) => merged.set(model.id, model));
  const models = Array.from(merged.values());
  await saveSnapshot(models);
  return NextResponse.json({ ok: true, count: models.length });
}
