import { z } from "zod";

export const ROLES = ["CLIENT", "SUPPLIER"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATES = [
  "DRAFT",
  "DESIGNING",
  "DESIGN_READY",
  "DESIGN_ERROR",
  "PLAN_APPROVED",
  "READY_TO_SHARE",
  "OPEN_FOR_QUOTES",
  "AWAITING_ACCEPTANCE",
  "ACCEPTED",
] as const;
export type ProjectState = (typeof PROJECT_STATES)[number];

export const VERSION_STATES = ["GENERATING", "READY", "FAILED", "SUPERSEDED", "APPROVED"] as const;
export type VersionState = (typeof VERSION_STATES)[number];
export const PROPOSAL_STATES = ["DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED"] as const;
export type ProposalState = (typeof PROPOSAL_STATES)[number];

export const CatalogKey = z.enum([
  "PAINT_WALLS", "PAINT_CEILING", "REPLACE_FLOOR", "INSTALL_BASEBOARD",
  "LIGHT_POINT", "CURTAIN", "SOFA", "RUG", "JOINERY", "PLANTS",
]);
export type CatalogKey = z.infer<typeof CatalogKey>;

export const RoomBriefSchema = z.object({
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().length(2).transform((v) => v.toUpperCase()),
  lengthMm: z.number().int().min(1000).max(20000),
  widthMm: z.number().int().min(1000).max(20000),
  heightMm: z.number().int().min(2000).max(6000),
  style: z.string().trim().min(2).max(120),
  budgetCents: z.number().int().min(0).max(100_000_000),
  priorities: z.array(z.string().trim().min(1).max(80)).min(1).max(6),
  preserve: z.array(z.string().trim().min(1).max(120)).max(8),
});
export type RoomBrief = z.infer<typeof RoomBriefSchema>;

export const RoomAnalysisSchema = z.object({
  observed: z.array(z.string()),
  uncertainties: z.array(z.string()),
  fixedElements: z.array(z.object({ label: z.string(), evidence: z.string(), confidence: z.number().min(0).max(1) })),
});
export type RoomAnalysis = z.infer<typeof RoomAnalysisSchema>;

export const DesignPlanSchema = z.object({
  summary: z.string(),
  interventions: z.array(z.object({
    catalogKey: CatalogKey,
    rationale: z.string(),
    quantityHint: z.string(),
    materials: z.array(z.string()),
    preserve: z.array(z.string()),
  })),
  imagePrompt: z.string(),
});
export type DesignPlan = z.infer<typeof DesignPlanSchema>;

export const QuantitySchema = z.object({
  catalogKey: CatalogKey,
  quantityMilli: z.number().int().nonnegative(),
  unit: z.string(),
  unitPriceCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  referenceCode: z.string(),
  referenceLabel: z.string(),
});
export type Quantity = z.infer<typeof QuantitySchema>;

export const ProjectSchema = z.object({
  id: z.string(), ownerId: z.string(), title: z.string(), state: z.enum(PROJECT_STATES),
  revision: z.number().int().nonnegative(), brief: RoomBriefSchema, analysis: RoomAnalysisSchema,
  originalAsset: z.string(), approvedVersionId: z.string().nullable(), createdAt: z.string(), updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const DesignVersionSchema = z.object({
  id: z.string(), projectId: z.string(), number: z.number().int().positive(), state: z.enum(VERSION_STATES),
  summary: z.string(), plan: DesignPlanSchema, imageDataUri: z.string(), quantities: z.array(QuantitySchema),
  costCents: z.number().int().nonnegative(), co2Grams: z.number().int().nonnegative(), createdAt: z.string(),
});
export type DesignVersion = z.infer<typeof DesignVersionSchema>;

export const ProposalLineSchema = z.object({ catalogKey: CatalogKey, quantityMilli: z.number().int().nonnegative(), priceCents: z.number().int().nonnegative(), note: z.string().max(300) });
export type ProposalLine = z.infer<typeof ProposalLineSchema>;
export const ProposalSchema = z.object({
  id: z.string(), opportunityId: z.string(), supplierId: z.string(), state: z.enum(PROPOSAL_STATES),
  lines: z.array(ProposalLineSchema), freightCents: z.number().int().nonnegative(), taxCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(), leadDays: z.number().int().positive(), validUntil: z.string(), includes: z.array(z.string()), excludes: z.array(z.string()),
});
export type Proposal = z.infer<typeof ProposalSchema>;
export const OpportunitySchema = z.object({
  id: z.string(), projectId: z.string(), city: z.string(), state: z.string(), title: z.string(), imageDataUri: z.string(),
  quantities: z.array(QuantitySchema), costCents: z.number().int().nonnegative(), co2Grams: z.number().int().nonnegative(), status: z.enum(["OPEN", "AWAITING_ACCEPTANCE", "ACCEPTED"]), expiresAt: z.string(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export class DomainError extends Error {
  constructor(public code: string, message: string, public status = 409) { super(message); this.name = "DomainError"; }
}

const transitions: Record<ProjectState, ProjectState[]> = {
  DRAFT: ["DESIGNING"], DESIGNING: ["DESIGN_READY", "DESIGN_ERROR"], DESIGN_READY: ["DESIGNING", "PLAN_APPROVED"],
  DESIGN_ERROR: ["DESIGNING"], PLAN_APPROVED: ["DESIGNING", "READY_TO_SHARE"], READY_TO_SHARE: ["OPEN_FOR_QUOTES"],
  OPEN_FOR_QUOTES: ["AWAITING_ACCEPTANCE"], AWAITING_ACCEPTANCE: ["ACCEPTED"], ACCEPTED: [],
};
export function assertProjectTransition(from: ProjectState, to: ProjectState) {
  if (!transitions[from].includes(to)) throw new DomainError("ILLEGAL_TRANSITION", `${from} → ${to} não é permitido`);
}

const priceMap: Record<CatalogKey, { unit: string; price: number; code: string; label: string; factor: number }> = {
  PAINT_WALLS: { unit: "m²", price: 1_850, code: "88489", label: "Pintura de paredes", factor: 1 },
  PAINT_CEILING: { unit: "m²", price: 1_650, code: "88488", label: "Pintura de teto", factor: 1 },
  REPLACE_FLOOR: { unit: "m²", price: 8_900, code: "87262", label: "Piso vinílico", factor: 1.1 },
  INSTALL_BASEBOARD: { unit: "m", price: 2_800, code: "88650", label: "Rodapé", factor: 1 },
  LIGHT_POINT: { unit: "un", price: 18_500, code: "93128+103782", label: "Ponto de luz", factor: 1 },
  CURTAIN: { unit: "un", price: 48_000, code: "SEM_REFERENCIA", label: "Cortina de linho", factor: 1 },
  SOFA: { unit: "un", price: 320_000, code: "SEM_REFERENCIA", label: "Sofá", factor: 1 },
  RUG: { unit: "un", price: 78_000, code: "SEM_REFERENCIA", label: "Tapete", factor: 1 },
  JOINERY: { unit: "un", price: 420_000, code: "SEM_REFERENCIA", label: "Marcenaria", factor: 1 },
  PLANTS: { unit: "un", price: 16_000, code: "SEM_REFERENCIA", label: "Plantas", factor: 1 },
};

function rounded(value: number) { return Math.max(0, Math.round(value)); }
export function estimateQuantities(brief: RoomBrief, keys: CatalogKey[] = ["PAINT_WALLS", "PAINT_CEILING", "REPLACE_FLOOR", "INSTALL_BASEBOARD", "LIGHT_POINT", "CURTAIN", "SOFA", "RUG", "PLANTS"]): Quantity[] {
  const l = brief.lengthMm / 1000, w = brief.widthMm / 1000, h = brief.heightMm / 1000;
  const area = l * w; const walls = 2 * (l + w) * h * 0.85; const baseboard = 2 * (l + w) * 0.9 * 1.1;
  const values: Partial<Record<CatalogKey, number>> = { PAINT_WALLS: walls, PAINT_CEILING: area, REPLACE_FLOOR: area * 1.1, INSTALL_BASEBOARD: baseboard, LIGHT_POINT: 2, CURTAIN: 1, SOFA: 1, RUG: 1, PLANTS: 3, JOINERY: 0 };
  return keys.map((catalogKey) => { const meta = priceMap[catalogKey]; const quantity = rounded((values[catalogKey] ?? 1) * 1000); const totalCents = rounded(quantity / 1000 * meta.price); return { catalogKey, quantityMilli: quantity, unit: meta.unit, unitPriceCents: meta.price, totalCents, referenceCode: meta.code, referenceLabel: meta.label }; });
}
export function totalQuantities(items: Quantity[]) { return items.reduce((sum, item) => sum + item.totalCents, 0); }
export function demoBrief(): RoomBrief { return { city: "São Paulo", state: "SP", lengthMm: 4000, widthMm: 3000, heightMm: 2700, style: "contemporâneo acolhedor", budgetCents: 4_500_000, priorities: ["mais luz", "madeira quente"], preserve: ["sem obra estrutural"] }; }
