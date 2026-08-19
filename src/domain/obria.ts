import { z } from "zod";

export const ROLES = ["CLIENT", "SUPPLIER"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATES = [
  "DRAFT", "DESIGNING", "DESIGN_READY", "DESIGN_ERROR", "PLAN_APPROVED",
  "READY_TO_SHARE", "OPEN_FOR_QUOTES", "AWAITING_ACCEPTANCE", "ACCEPTED",
] as const;
export type ProjectState = (typeof PROJECT_STATES)[number];
export const VERSION_STATES = ["GENERATING", "READY", "FAILED", "SUPERSEDED", "APPROVED"] as const;
export const PROPOSAL_STATES = ["DRAFT", "SUBMITTED", "ACCEPTED", "REJECTED"] as const;

export const CatalogKey = z.enum([
  "PAINT_WALLS", "PAINT_CEILING", "REPLACE_FLOOR", "INSTALL_BASEBOARD",
  "LIGHT_POINT", "CURTAIN", "SOFA", "RUG", "SIDE_TABLE", "JOINERY", "PLANTS",
]);
export type CatalogKey = z.infer<typeof CatalogKey>;
export const ProductCatalogKey = z.enum(["LIGHT_POINT", "RUG", "SIDE_TABLE"]);
export type ProductCatalogKey = z.infer<typeof ProductCatalogKey>;

export const ProductNeedSchema = z.object({
  id: z.string().min(1).max(80),
  catalogKey: ProductCatalogKey,
  label: z.string().min(2).max(120),
  searchQuery: z.string().min(3).max(160),
  requiredTermGroups: z.array(z.array(z.string().min(1).max(30)).min(1).max(5)).min(1).max(4),
  quantity: z.number().int().min(1).max(20),
  constraints: z.array(z.string().max(120)).max(8),
});
export type ProductNeed = z.infer<typeof ProductNeedSchema>;

export const RoomBriefSchema = z.object({
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  lengthMm: z.number().int().min(1000).max(20000),
  widthMm: z.number().int().min(1000).max(20000),
  heightMm: z.number().int().min(2000).max(6000),
  style: z.string().trim().min(2).max(120),
  budgetCents: z.number().int().min(0).max(100_000_000),
  priorities: z.array(z.string().trim().min(1).max(80)).min(1).max(6),
  preserve: z.array(z.string().trim().min(1).max(120)).max(8),
});
export type RoomBrief = z.infer<typeof RoomBriefSchema>;

export const SourceImageDataUriSchema = z.string()
  .max(7_000_000)
  .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/, "Imagem de origem inválida");

export const CreateDesignInputSchema = z.object({
  sourceImageDataUri: SourceImageDataUriSchema,
  prompt: z.string().trim().min(1).max(1000).optional(),
}).strict();
export type CreateDesignInput = z.infer<typeof CreateDesignInputSchema>;

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
  productNeeds: z.array(ProductNeedSchema).min(1).max(8),
  imagePrompt: z.string(),
});
export type DesignPlan = z.infer<typeof DesignPlanSchema>;

export const WorkQuantitySchema = z.object({
  catalogKey: CatalogKey,
  quantityMilli: z.number().int().nonnegative(),
  unit: z.string(),
  referenceCode: z.string(),
  referenceLabel: z.string(),
});
export type WorkQuantity = z.infer<typeof WorkQuantitySchema>;

export const ProjectSchema = z.object({
  id: z.string(), ownerId: z.string(), title: z.string(), state: z.enum(PROJECT_STATES),
  revision: z.number().int().nonnegative(), brief: RoomBriefSchema, analysis: RoomAnalysisSchema,
  originalAsset: z.string(), approvedVersionId: z.string().nullable(), createdAt: z.string(), updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const DesignVersionSchema = z.object({
  id: z.string(), projectId: z.string(), number: z.number().int().positive(), state: z.enum(VERSION_STATES),
  summary: z.string(), plan: DesignPlanSchema, imageDataUri: z.string(), workQuantities: z.array(WorkQuantitySchema), createdAt: z.string(),
});
export type DesignVersion = z.infer<typeof DesignVersionSchema>;

export const ProposalLineSchema = z.object({
  catalogKey: CatalogKey,
  quantityMilli: z.number().int().nonnegative(),
  laborPriceCents: z.number().int().nonnegative(),
  note: z.string().max(300),
});
export type ProposalLine = z.infer<typeof ProposalLineSchema>;
export const CreateProposalInputSchema = z.object({
  lines: z.array(ProposalLineSchema).min(1).max(30),
  freightCents: z.number().int().nonnegative(),
  taxCents: z.number().int().nonnegative(),
  leadDays: z.number().int().positive().max(365),
  validUntil: z.string().datetime(),
  includes: z.array(z.string().max(200)).max(30),
  excludes: z.array(z.string().max(200)).max(30),
});
export type CreateProposalInput = z.infer<typeof CreateProposalInputSchema>;
export const ProposalSchema = CreateProposalInputSchema.extend({
  id: z.string(), opportunityId: z.string(), supplierId: z.string(), state: z.enum(PROPOSAL_STATES),
  laborSubtotalCents: z.number().int().nonnegative(), totalCents: z.number().int().nonnegative(),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const DecisionPathKindSchema = z.enum(["LOWEST_UPFRONT", "BEST_USE_EFFICIENCY", "MOST_SUSTAINABLE"]);
export const SelectedProductSchema = z.object({
  needId: z.string(), catalogKey: ProductCatalogKey, label: z.string(), quantity: z.number().int().positive(),
  path: DecisionPathKindSchema, provider: z.enum(["SHOPEE_AFFILIATE", "REPLAY"]), offerId: z.string(),
  productName: z.string(), shopName: z.string(), productUrl: z.string().url(), offerUrl: z.string().url(),
  unitPriceCents: z.object({ low: z.number().int().nonnegative(), high: z.number().int().nonnegative() }),
  totalPriceCents: z.object({ low: z.number().int().nonnegative(), high: z.number().int().nonnegative() }),
  whatToVerifyPtBr: z.array(z.string()),
});
export type SelectedProduct = z.infer<typeof SelectedProductSchema>;

export const OpportunitySchema = z.object({
  id: z.string(), projectId: z.string(), city: z.string(), state: z.string(), title: z.string(), imageDataUri: z.string(),
  workQuantities: z.array(WorkQuantitySchema), selectedProducts: z.array(SelectedProductSchema),
  materialsEstimateCents: z.number().int().nonnegative(),
  priceResearch: z.object({ provider: z.enum(["SHOPEE_AFFILIATE", "REPLAY"]), collectedAt: z.string(), noticePtBr: z.string() }),
  laborPricing: z.literal("SUPPLIER_QUOTE_REQUIRED"),
  status: z.enum(["OPEN", "AWAITING_ACCEPTANCE", "ACCEPTED"]), expiresAt: z.string(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

export class DomainError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 409) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.status = status;
  }
}

const transitions: Record<ProjectState, ProjectState[]> = {
  DRAFT: ["DESIGNING"], DESIGNING: ["DESIGN_READY", "DESIGN_ERROR"], DESIGN_READY: ["DESIGNING", "PLAN_APPROVED"],
  DESIGN_ERROR: ["DESIGNING"], PLAN_APPROVED: ["DESIGNING", "READY_TO_SHARE"], READY_TO_SHARE: ["OPEN_FOR_QUOTES"],
  OPEN_FOR_QUOTES: ["AWAITING_ACCEPTANCE"], AWAITING_ACCEPTANCE: ["ACCEPTED"], ACCEPTED: [],
};
export function assertProjectTransition(from: ProjectState, to: ProjectState) {
  if (!transitions[from].includes(to)) throw new DomainError("ILLEGAL_TRANSITION", `${from} → ${to} não é permitido`);
}

const workMeta: Partial<Record<CatalogKey, { unit: string; code: string; label: string }>> = {
  PAINT_WALLS: { unit: "m²", code: "88489", label: "Pintura de paredes" },
  PAINT_CEILING: { unit: "m²", code: "88488", label: "Pintura de teto" },
  REPLACE_FLOOR: { unit: "m²", code: "87262", label: "Instalação de piso" },
  INSTALL_BASEBOARD: { unit: "m", code: "88650", label: "Instalação de rodapé" },
  LIGHT_POINT: { unit: "un", code: "93128+103782", label: "Instalação de ponto de luz" },
  JOINERY: { unit: "un", code: "SEM_REFERENCIA", label: "Instalação de marcenaria" },
};

export function estimateWorkQuantities(brief: RoomBrief, keys: CatalogKey[]): WorkQuantity[] {
  const length = brief.lengthMm / 1000;
  const width = brief.widthMm / 1000;
  const height = brief.heightMm / 1000;
  const area = length * width;
  const values: Partial<Record<CatalogKey, number>> = {
    PAINT_WALLS: 2 * (length + width) * height * 0.85,
    PAINT_CEILING: area,
    REPLACE_FLOOR: area * 1.1,
    INSTALL_BASEBOARD: 2 * (length + width) * 0.9 * 1.1,
    LIGHT_POINT: 2,
    JOINERY: 1,
  };
  return [...new Set(keys)].flatMap((catalogKey) => {
    const meta = workMeta[catalogKey];
    if (!meta) return [];
    return [{ catalogKey, quantityMilli: Math.max(0, Math.round((values[catalogKey] ?? 1) * 1000)), unit: meta.unit, referenceCode: meta.code, referenceLabel: meta.label }];
  });
}

export function demoBrief(): RoomBrief {
  return { city: "São Paulo", state: "SP", lengthMm: 4000, widthMm: 3000, heightMm: 2700, style: "contemporâneo acolhedor", budgetCents: 4_500_000, priorities: ["mais luz", "madeira quente"], preserve: ["sem obra estrutural"] };
}
