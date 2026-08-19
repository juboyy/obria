export type RoomType =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "other";

export type FinishTier = "economy" | "standard" | "premium";
export type EstimateProfile = "economic" | "ecological";
export type EstimatePreference = EstimateProfile | "both";

export type ScopeCategory =
  | "wall_painting"
  | "ceiling_painting"
  | "floor_removal"
  | "floor_installation"
  | "floor_restoration"
  | "baseboard_installation"
  | "lighting_point"
  | "electrical_point"
  | "drywall_partition"
  | "demolition_light"
  | "debris_removal"
  | "site_protection_cleaning"
  | "custom_cabinetry"
  | "loose_furniture"
  | "stonework"
  | "plumbing_relocation"
  | "structural_change"
  | "window_replacement"
  | "gas_hvac"
  | "waterproofing"
  | "major_electrical_upgrade";

export type ScopeUnit = "m2" | "linear_m" | "unit" | "service";

export type QuantitySource =
  | { type: "informed"; notePtBr?: string }
  | { type: "calculated"; formulaPtBr: string }
  | { type: "assumed"; assumptionPtBr: string };

export type ConfirmedScopeItem = {
  id: string;
  category: ScopeCategory;
  labelPtBr: string;
  quantity: number;
  unit: ScopeUnit;
  quantitySource: QuantitySource;
  confirmed: true;
  notesPtBr?: string;
};

export type ProjectStatus =
  | "INTAKE"
  | "UPLOADING"
  | "READY_TO_GENERATE"
  | "GENERATING_INITIAL"
  | "REVIEWING_OPTIONS"
  | "GENERATING_REFINEMENT"
  | "REVIEWING_REFINEMENT"
  | "CLARIFYING_SCOPE"
  | "CONFIRMING_SCOPE"
  | "CALCULATING_ESTIMATES"
  | "COMPARING_ESTIMATES"
  | "PREVIEWING_MARKETPLACE_POST"
  | "MARKETPLACE_POSTED_DEMO"
  | "ERROR";

export type Project = {
  id: string;
  status: ProjectStatus;
  city: string;
  uf: string;
  roomType: RoomType;
  areaM2: number;
  finishTier: FinishTier;
  originalInstruction: string;
  originalImageUrl?: string;
  selectedVariantId?: string;
  generationCount: number;
  confirmedScope: ConfirmedScopeItem[];
  preferredEstimateProfile?: EstimatePreference;
};

export type GeneratedVariant = {
  id: string;
  generationId: string;
  ordinal: 1 | 2 | 3 | 4;
  label: "A" | "B" | "C" | "D";
  imageUrl: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

type GenerationBase = {
  id: string;
  projectId: string;
  kind: "initial" | "refinement";
  instruction: string;
  parentVariantId?: string;
};

export type Generation =
  | (GenerationBase & { status: "queued" | "processing"; variants: [] })
  | (GenerationBase & { status: "completed"; variants: GeneratedVariant[] })
  | (GenerationBase & {
      status: "failed";
      variants: [];
      error: { code: string; messagePtBr: string };
    });

export type MoneyRange = { low: number; high: number };

export type EstimateLineItem = {
  scopeItemId: string;
  scopeCategory: ScopeCategory;
  labelPtBr: string;
  quantity: number;
  unit: ScopeUnit;
  catalogueChoiceId: string;
  catalogueChoiceLabelPtBr: string;
  materialCost: number;
  laborCost: number;
  directCost: number;
  isEcologicalAlternative: boolean;
};

export type EstimateExclusion = {
  scopeItemId: string;
  scopeCategory: ScopeCategory;
  reasonPtBr: string;
};

export type EstimateResult = {
  profile: EstimateProfile;
  lineItems: EstimateLineItem[];
  excludedItems: EstimateExclusion[];
  breakdown: {
    materials: number;
    labor: number;
    direct: number;
    contingency: number;
    overheadBdi: number;
  };
  expectedTotal: number;
  range: MoneyRange;
  assumptionsPtBr: string[];
};

export type EcoImpactCategory =
  | "waste"
  | "materials"
  | "energy"
  | "water"
  | "indoor_environment";

export type EstimateComparison = {
  scopeCategory: ScopeCategory;
  economicChoice: string;
  ecologicalChoice: string;
  upfrontDifference: number;
  rationale: string;
  tradeoff: string;
  impactCategories: EcoImpactCategory[];
  verificationNote: string;
};

export type DualEstimateResponse = {
  datasetVersion: string;
  referencePeriod: string;
  regionalReference: { uf: string };
  economic: EstimateResult;
  ecological: EstimateResult;
  comparisons: EstimateComparison[];
  sharedAssumptions: string[];
  exclusions: string[];
};
