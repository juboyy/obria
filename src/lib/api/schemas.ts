import { z } from "zod";

export const roomTypeSchema = z.enum([
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "office",
  "other",
]);

export const finishTierSchema = z.enum(["economy", "standard", "premium"]);

export const scopeCategorySchema = z.enum([
  "wall_painting",
  "ceiling_painting",
  "floor_removal",
  "floor_installation",
  "floor_restoration",
  "baseboard_installation",
  "lighting_point",
  "electrical_point",
  "drywall_partition",
  "demolition_light",
  "debris_removal",
  "site_protection_cleaning",
  "custom_cabinetry",
  "loose_furniture",
  "stonework",
  "plumbing_relocation",
  "structural_change",
  "window_replacement",
  "gas_hvac",
  "waterproofing",
  "major_electrical_upgrade",
]);

const quantitySourceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("informed"), notePtBr: z.string().min(1).optional() }).strict(),
  z.object({ type: z.literal("calculated"), formulaPtBr: z.string().min(1) }).strict(),
  z.object({ type: z.literal("assumed"), assumptionPtBr: z.string().min(1) }).strict(),
]);

export const confirmedScopeItemSchema = z
  .object({
    id: z.string().min(1),
    category: scopeCategorySchema,
    labelPtBr: z.string().min(1),
    quantity: z.number().positive().finite(),
    unit: z.enum(["m2", "linear_m", "unit", "service"]),
    quantitySource: quantitySourceSchema,
    confirmed: z.literal(true),
    notesPtBr: z.string().min(1).optional(),
  })
  .strict();

export const createProjectRequestSchema = z
  .object({
    city: z.string().trim().min(2).max(80),
    uf: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    roomType: roomTypeSchema,
    areaM2: z.number().positive().max(1_000),
    finishTier: finishTierSchema,
    originalInstruction: z.string().trim().min(10).max(800),
  })
  .strict();

export const createGenerationRequestSchema = z
  .object({
    projectId: z.string().min(1),
    parentVariantId: z.string().min(1).optional(),
    instruction: z.string().trim().min(10).max(800).optional(),
  })
  .strict();

export const estimateRequestSchema = z
  .object({
    uf: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    finishTier: finishTierSchema,
    scope: z.array(confirmedScopeItemSchema).min(1),
  })
  .strict();

const moneyRangeSchema = z
  .object({ low: z.number().nonnegative(), high: z.number().nonnegative() })
  .strict()
  .refine((range) => range.high >= range.low, {
    message: "O limite superior deve ser maior ou igual ao inferior.",
  });

export const marketplaceProjectPostSchema = z
  .object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    title: z.string().trim().min(3).max(120),
    city: z.string().trim().min(2).max(80),
    uf: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    roomType: roomTypeSchema,
    areaM2: z.number().positive().max(1_000),
    coverVariantId: z.string().min(1),
    includeOriginalImage: z.boolean(),
    confirmedScope: z.array(confirmedScopeItemSchema).min(1),
    estimatePreference: z.enum(["economic", "ecological", "both"]),
    economicRange: moneyRangeSchema,
    ecologicalRange: moneyRangeSchema,
    sustainabilityPreferences: z.array(z.string().trim().min(1).max(120)).max(10),
    desiredStart: z.enum([
      "urgent",
      "within_30_days",
      "one_to_three_months",
      "researching",
    ]),
    datesFlexible: z.boolean(),
    allowEquivalentAlternatives: z.boolean(),
    note: z.string().trim().max(300).optional(),
    status: z.enum(["draft", "marketplace_demo_published"]),
  })
  .strict();

export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
export type CreateGenerationRequest = z.infer<typeof createGenerationRequestSchema>;
export type EstimateRequest = z.infer<typeof estimateRequestSchema>;
