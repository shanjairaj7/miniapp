import type { HFTag } from "./hf";

export type CategoryGroup = {
  id: string;
  label: string;
  tags: HFTag[];
};

const subtypeLabels: Record<string, { id: string; label: string }> = {
  nlp: { id: "language", label: "Language" },
  cv: { id: "vision", label: "Computer Vision" },
  audio: { id: "audio", label: "Audio" },
  video: { id: "video", label: "Video" },
  multimodal: { id: "multimodal", label: "Multimodal" },
  "3d": { id: "3d", label: "3D" },
  tabular: { id: "tabular", label: "Tabular" },
  rl: { id: "rl", label: "Reinforcement Learning" },
  time_series: { id: "time-series", label: "Time Series" },
};

function inferGroup(tag: HFTag) {
  const id = tag.id;
  if (id.includes("image") || id.includes("vision") || id.includes("segmentation") || id.includes("detection") || id.includes("depth")) {
    return { id: "vision", label: "Computer Vision" };
  }
  if (id.includes("text") || id.includes("summarization") || id.includes("translation") || id.includes("question") || id.includes("language")) {
    return { id: "language", label: "Language" };
  }
  if (id.includes("audio") || id.includes("speech") || id.includes("asr") || id.includes("tts")) {
    return { id: "audio", label: "Audio" };
  }
  if (id.includes("video")) {
    return { id: "video", label: "Video" };
  }
  if (id.includes("3d") || id.includes("point-cloud") || id.includes("mesh")) {
    return { id: "3d", label: "3D" };
  }
  if (id.includes("time-series") || id.includes("forecast")) {
    return { id: "time-series", label: "Time Series" };
  }
  return { id: "other", label: "Other" };
}

export function groupPipelineTags(tags: HFTag[]) {
  const grouped = new Map<string, CategoryGroup>();
  tags.forEach((tag) => {
    const base = tag.subType && subtypeLabels[tag.subType]
      ? subtypeLabels[tag.subType]
      : inferGroup(tag);
    const existing = grouped.get(base.id);
    if (existing) {
      existing.tags.push(tag);
    } else {
      grouped.set(base.id, { id: base.id, label: base.label, tags: [tag] });
    }
  });
  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
}
