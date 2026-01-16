export type OpenAlexWork = {
  id: string;
  title?: string;
  publication_date?: string;
  cited_by_count?: number;
  topics?: { display_name: string }[];
  primary_location?: {
    source?: { display_name?: string };
    landing_page_url?: string;
  };
  open_access?: {
    is_oa?: boolean;
    oa_status?: string;
  };
};

const OA_BASE = "https://api.openalex.org";

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${OA_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function fetchJson<T>(url: string, revalidate = 60 * 60) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`OpenAlex request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getOpenAlexWorkByArxivId(arxivId: string) {
  const doi = `10.48550/arxiv.${arxivId}`;
  const url = buildUrl("/works", {
    filter: `doi:${doi}`,
    select: "id,title,publication_date,cited_by_count,topics,primary_location,open_access",
    mailto: process.env.OPENALEX_EMAIL,
  });

  const data = await fetchJson<{ results: OpenAlexWork[] }>(url, 60 * 60 * 6);
  return data.results?.[0] ?? null;
}
