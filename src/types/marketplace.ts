import type {
  ConfirmedScopeItem,
  EstimatePreference,
  MoneyRange,
  RoomType,
} from "./domain";

export type MarketplaceProjectPost = {
  id: string;
  projectId: string;
  title: string;
  city: string;
  uf: string;
  roomType: RoomType;
  areaM2: number;
  coverVariantId: string;
  includeOriginalImage: boolean;
  confirmedScope: ConfirmedScopeItem[];
  estimatePreference: EstimatePreference;
  economicRange: MoneyRange;
  ecologicalRange: MoneyRange;
  sustainabilityPreferences: string[];
  desiredStart:
    | "urgent"
    | "within_30_days"
    | "one_to_three_months"
    | "researching";
  datesFlexible: boolean;
  allowEquivalentAlternatives: boolean;
  note?: string;
  status: "draft" | "marketplace_demo_published";
};

export type DemoProfessional = {
  id: string;
  isDemo: true;
  name: string;
  city: string;
  uf: string;
  specialties: string[];
  priceTier: "economy" | "standard" | "premium";
  supportsEcoOptions: boolean;
  availability: "immediate" | "within_30_days" | "one_to_three_months";
  responseTimeLabel: string;
  rating: number;
  reviewCount: number;
  portfolioImages: string[];
};

export type DemoProposal = {
  id: string;
  isDemo: true;
  professionalId: string;
  projectId: string;
  headline: string;
  summary: string;
  priceRange: MoneyRange;
  estimatedDurationLabel: string;
  highlights: string[];
  supportsEcoOptions: boolean;
  status: "demo";
};

export type ProfessionalMatch = {
  professional: DemoProfessional;
  score: number;
  reasons: string[];
};
