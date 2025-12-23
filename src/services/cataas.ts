import type { Cat } from "../types";

const CATAAS = "https://cataas.com";
const LIMIT = 15;

type CataasCat = {
  _id?: string;
  id?: string;
  tags?: string[];
};

function buildImageUrl(idOrNull?: string, seed?: string) {
  if (idOrNull) {
    return `${CATAAS}/cat/${idOrNull}?type=square&width=600&height=800`;
  }
  return `${CATAAS}/cat?type=square&width=600&height=800&seed=${encodeURIComponent(
    seed || String(Date.now())
  )}`;
}

export async function loadCats(limit = LIMIT): Promise<Cat[]> {
  try {
    const res = await fetch(`${CATAAS}/api/cats?limit=${limit}&skip=0`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as CataasCat[];
    return data.map((c, idx) => {
      const id = c._id || c.id || `cat-${idx}`;
      return {
        id,
        tags: c.tags ?? [],
        imageUrl: buildImageUrl(c._id || c.id),
      };
    });
  } catch {
    return Array.from({ length: limit }).map((_, idx) => ({
      id: `fallback-${idx}`,
      imageUrl: buildImageUrl(undefined, `${Date.now()}-${idx}`),
      tags: [],
    }));
  }
}
