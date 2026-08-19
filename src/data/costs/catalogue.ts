import type { ScopeCategory, ScopeUnit } from "@/types";

export type CostCatalogueItem = {
  id: string;
  scopeCategory: ScopeCategory;
  labelPtBr: string;
  unit: ScopeUnit;
  baseMaterialUnit: number;
  baseLaborUnit: number;
};

export const COST_DATASET = {
  version: "demo-sp-2026-08-v1",
  referencePeriod: "2026-08 (referência demonstrativa)",
  baseUf: "SP",
  noticePtBr:
    "Catálogo demonstrativo para planejamento do protótipo; não representa extração vigente do SINAPI.",
  sourceUrl:
    "https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx",
} as const;

export const COST_CATALOGUE = [
  { id: "paint-standard", scopeCategory: "wall_painting", labelPtBr: "Pintura de paredes — referência padrão", unit: "m2", baseMaterialUnit: 12, baseLaborUnit: 18 },
  { id: "ceiling-standard", scopeCategory: "ceiling_painting", labelPtBr: "Pintura de teto — referência padrão", unit: "m2", baseMaterialUnit: 10, baseLaborUnit: 16 },
  { id: "floor-remove-standard", scopeCategory: "floor_removal", labelPtBr: "Remoção convencional de piso", unit: "m2", baseMaterialUnit: 2, baseLaborUnit: 20 },
  { id: "floor-install-standard", scopeCategory: "floor_installation", labelPtBr: "Fornecimento e instalação de piso — referência padrão", unit: "m2", baseMaterialUnit: 48, baseLaborUnit: 36 },
  { id: "floor-restore-standard", scopeCategory: "floor_restoration", labelPtBr: "Restauração de piso existente", unit: "m2", baseMaterialUnit: 18, baseLaborUnit: 52 },
  { id: "baseboard-standard", scopeCategory: "baseboard_installation", labelPtBr: "Fornecimento e instalação de rodapé", unit: "linear_m", baseMaterialUnit: 20, baseLaborUnit: 18 },
  { id: "light-basic", scopeCategory: "lighting_point", labelPtBr: "Ponto de iluminação básico", unit: "unit", baseMaterialUnit: 35, baseLaborUnit: 65 },
  { id: "electrical-standard", scopeCategory: "electrical_point", labelPtBr: "Ponto elétrico padrão", unit: "unit", baseMaterialUnit: 42, baseLaborUnit: 85 },
  { id: "drywall-standard", scopeCategory: "drywall_partition", labelPtBr: "Parede drywall padrão", unit: "m2", baseMaterialUnit: 55, baseLaborUnit: 68 },
  { id: "demolition-standard", scopeCategory: "demolition_light", labelPtBr: "Demolição leve convencional", unit: "m2", baseMaterialUnit: 8, baseLaborUnit: 32 },
  { id: "debris-standard", scopeCategory: "debris_removal", labelPtBr: "Retirada de entulho", unit: "service", baseMaterialUnit: 280, baseLaborUnit: 320 },
  { id: "protection-standard", scopeCategory: "site_protection_cleaning", labelPtBr: "Proteção e limpeza do local", unit: "service", baseMaterialUnit: 180, baseLaborUnit: 270 },
  { id: "paint-low-emission", scopeCategory: "wall_painting", labelPtBr: "Tinta à base d’água com emissão verificada", unit: "m2", baseMaterialUnit: 17, baseLaborUnit: 18 },
  { id: "floor-restore-eco", scopeCategory: "floor_installation", labelPtBr: "Restauração do piso existente, quando viável", unit: "m2", baseMaterialUnit: 18, baseLaborUnit: 52 },
  { id: "light-led", scopeCategory: "lighting_point", labelPtBr: "Solução LED eficiente", unit: "unit", baseMaterialUnit: 55, baseLaborUnit: 65 },
  { id: "demolition-selective", scopeCategory: "demolition_light", labelPtBr: "Remoção seletiva com separação para reaproveitamento", unit: "m2", baseMaterialUnit: 5, baseLaborUnit: 48 },
] as const satisfies readonly CostCatalogueItem[];

export const ECONOMIC_CHOICE_BY_CATEGORY: Partial<Record<ScopeCategory, string>> = {
  wall_painting: "paint-standard",
  ceiling_painting: "ceiling-standard",
  floor_removal: "floor-remove-standard",
  floor_installation: "floor-install-standard",
  floor_restoration: "floor-restore-standard",
  baseboard_installation: "baseboard-standard",
  lighting_point: "light-basic",
  electrical_point: "electrical-standard",
  drywall_partition: "drywall-standard",
  demolition_light: "demolition-standard",
  debris_removal: "debris-standard",
  site_protection_cleaning: "protection-standard",
};

export const UF_PRICE_FACTORS: Readonly<Record<string, number>> = {
  AC: 1.03, AL: 0.91, AP: 1.08, AM: 1.07, BA: 0.94, CE: 0.93, DF: 1.08,
  ES: 1.01, GO: 0.96, MA: 0.9, MT: 1.02, MS: 0.99, MG: 0.97, PA: 1.04,
  PB: 0.92, PR: 0.99, PE: 0.95, PI: 0.9, RJ: 1.06, RN: 0.93, RS: 1.01,
  RO: 1.04, RR: 1.09, SC: 1.03, SP: 1, SE: 0.92, TO: 0.98,
};
