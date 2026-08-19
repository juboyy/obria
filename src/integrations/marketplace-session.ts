import { z } from "zod";

export const MARKETPLACE_STORAGE_KEY = "obria.marketplace.project.v1";

const MarketplaceSessionProjectSchema = z.object({
  version: z.literal(1),
  imageUrl: z.string().max(4_000_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
  variantLabel: z.string().min(1).max(2),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(240),
  roomLabel: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(120),
  areaM2: z.number().positive().max(1000).nullable(),
  finishLabel: z.string().trim().min(1).max(40).nullable(),
  request: z.string().trim().min(10).max(800),
}).strict();

export type MarketplaceSessionProject = Omit<z.infer<typeof MarketplaceSessionProjectSchema>, "version">;

export function serializeMarketplaceProject(project: MarketplaceSessionProject) {
  return JSON.stringify(MarketplaceSessionProjectSchema.parse({ version: 1, ...project }));
}

export function parseMarketplaceProject(raw: string | null): MarketplaceSessionProject | null {
  if (!raw) return null;
  try {
    const parsed = MarketplaceSessionProjectSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { version, ...project } = parsed.data;
    void version;
    return project;
  } catch {
    return null;
  }
}
