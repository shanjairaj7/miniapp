import type { HFModel, HFModelDetail } from "./hf";

const permissiveLicenses = [
  "apache-2.0",
  "mit",
  "bsd",
  "bsd-3-clause",
  "cc-by-4.0",
  "cc-by",
  "isc",
  "mpl-2.0",
];

export function extractLicense(tags: string[] = []) {
  const tag = tags.find((item) => item.startsWith("license:"));
  const license = tag?.replace("license:", "");
  const isPermissive = license ? permissiveLicenses.includes(license) : false;
  return { license, isPermissive };
}

export function extractArxivId(tags: string[] = []) {
  const tag = tags.find((item) => item.startsWith("arxiv:"));
  return tag ? tag.replace("arxiv:", "") : null;
}

export function getPaperThumbnail(arxivId?: string | null) {
  if (!arxivId) return null;
  return `https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/${arxivId}.png`;
}

export function extractLanguages(tags: string[] = []) {
  return tags.filter((tag) => tag.length === 2 || tag.startsWith("lang:"));
}

export function extractDatasets(tags: string[] = []) {
  return tags
    .filter((tag) => tag.startsWith("dataset:"))
    .map((tag) => tag.replace("dataset:", ""));
}

export function getProviderCount(model: HFModelDetail) {
  return Object.keys(model.inferenceProviderMapping ?? {}).length;
}

export function isDeployable(model: HFModelDetail) {
  const providers = getProviderCount(model);
  const safetensors = model.safetensors?.total ?? 0;
  const gguf = model.gguf?.total ?? 0;
  return providers > 0 || safetensors > 0 || gguf > 0;
}

export function attachSignalMeta(model: HFModel) {
  const { license, isPermissive } = extractLicense(model.tags ?? []);
  const arxivId = extractArxivId(model.tags ?? []);
  return {
    license,
    isPermissive,
    arxivId,
    paperThumbnail: getPaperThumbnail(arxivId),
  };
}
