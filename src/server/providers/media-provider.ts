import { createHash } from "node:crypto";
import { getDesignPlan } from "@/server/demo-store";
import { type DesignPlan, type RoomAnalysis, type RoomBrief } from "@/domain/obria";

export type MediaJob = { provider: "replay" | "live"; providerId: string; imageDataUri: string; plan: DesignPlan };
export interface MediaProvider { analyzeRoom(brief: RoomBrief): Promise<RoomAnalysis>; createDesign(input: { brief: RoomBrief; iteration: number; prompt?: string; currentImageDataUri?: string }): Promise<MediaJob>; }

const stableId = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);
export class ReplayMediaProvider implements MediaProvider {
  async analyzeRoom(): Promise<RoomAnalysis> { return { observed: ["sala retangular", "vão de luz lateral", "piso existente preservável", "paredes sem sinais de infiltração"], uncertainties: ["posição exata das tomadas", "estado do contrapiso sob o piso atual"], fixedElements: [{ label: "vão principal", evidence: "abertura clara no lado direito da foto", confidence: 0.86 }, { label: "piso existente", evidence: "continuidade visual do piso", confidence: 0.72 }] }; }
  async createDesign(input: { brief: RoomBrief; iteration: number; prompt?: string }): Promise<MediaJob> { const plan = getDesignPlan(input.iteration); const providerId = `replay-${stableId(JSON.stringify({ brief: input.brief, iteration: input.iteration, prompt: input.prompt ?? "" }))}`; const accent = input.iteration === 1 ? "#c9d4b2" : "#e7b68b"; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="#f1eadf"/><path d="M0 820h1536v204H0z" fill="#8b5e45"/><path d="M110 120h1316v700H110z" fill="${accent}"/><path d="M200 240h600v500H200z" fill="#f8f4ee"/><path d="M940 350h340v390H940z" fill="#d5c4a8"/><circle cx="1160" cy="260" r="82" fill="#b5c8a4"/><text x="100" y="940" font-family="monospace" font-size="34" fill="#1b2421">OBRIA / V${input.iteration} / SÃO PAULO</text></svg>`; return { provider: "replay", providerId, imageDataUri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, plan }; }
}
export class LiveMediaProvider extends ReplayMediaProvider {
  async createDesign(input: { brief: RoomBrief; iteration: number; prompt?: string; currentImageDataUri?: string }): Promise<MediaJob> { if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY ausente; modo live indisponível"); return super.createDesign(input); }
}
export function getMediaProvider(): MediaProvider { return process.env.OBRIA_PROVIDER_MODE === "live" ? new LiveMediaProvider() : new ReplayMediaProvider(); }
