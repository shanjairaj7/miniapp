export type CategoryTone = {
  label: string;
  color: string;
  bg: string;
};

export function getCategoryTone(pipeline?: string): CategoryTone {
  if (!pipeline) {
    return { label: "General", color: "#2f6feb", bg: "#e9efff" };
  }
  if (pipeline.includes("image") || pipeline.includes("vision") || pipeline.includes("segmentation")) {
    return { label: "Vision", color: "#ff7a1a", bg: "#fff0e6" };
  }
  if (pipeline.includes("text") || pipeline.includes("summarization") || pipeline.includes("translation")) {
    return { label: "Language", color: "#2f6feb", bg: "#e9efff" };
  }
  if (pipeline.includes("audio") || pipeline.includes("speech")) {
    return { label: "Audio", color: "#12b76a", bg: "#e6f7f0" };
  }
  if (pipeline.includes("video")) {
    return { label: "Video", color: "#7c4dff", bg: "#eee9ff" };
  }
  if (pipeline.includes("3d")) {
    return { label: "3D", color: "#ff6b6b", bg: "#ffecec" };
  }
  return { label: "Other", color: "#6f6f6f", bg: "#f0f0ef" };
}

export default function CategoryIcon({ pipeline }: { pipeline?: string }) {
  const tone = getCategoryTone(pipeline);
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-[12px]"
      style={{ backgroundColor: tone.bg }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tone.color} strokeWidth="1.8">
        <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
      </svg>
    </div>
  );
}
