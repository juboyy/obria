import { marketplaceProjectPostSchema } from "@/lib/api/schemas";
import type { MarketplaceProjectPost } from "@/types";

export const MARKETPLACE_POST_STORAGE_KEY = "obria-demo-marketplace-post";

export function parseMarketplacePost(
  raw: string | null,
  projectId: string,
): MarketplaceProjectPost | null {
  if (raw === null) return null;

  let candidate: unknown;
  try {
    candidate = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = marketplaceProjectPostSchema.safeParse(candidate);
  if (!parsed.success || parsed.data.projectId !== projectId) return null;

  return parsed.data;
}
