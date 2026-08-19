import type { EcoImpactCategory, ScopeCategory } from "@/types";

export type EcoAlternative = {
  id: string;
  scopeCategory: ScopeCategory;
  economicChoiceId: string;
  ecologicalChoiceId: string;
  labelPtBr: string;
  rationalePtBr: string;
  tradeoffPtBr: string;
  impactCategories: readonly EcoImpactCategory[];
  verificationNotePtBr: string;
  sourceNote: string;
};

export const ECO_CATALOGUE_VERSION = "demo-eco-2026-08-v1";

export const ECO_ALTERNATIVES = [
  {
    id: "eco-paint-low-emission",
    scopeCategory: "wall_painting",
    economicChoiceId: "paint-standard",
    ecologicalChoiceId: "paint-low-emission",
    labelPtBr: "Tinta à base d’água com emissão verificada",
    rationalePtBr: "Pode favorecer a qualidade do ambiente interno quando a ficha técnica confirma baixa emissão.",
    tradeoffPtBr: "O custo inicial do material pode ser maior e a disponibilidade varia por fornecedor.",
    impactCategories: ["indoor_environment", "materials"],
    verificationNotePtBr: "Confirmar ficha técnica, preparação da superfície e produto fornecido antes da aplicação.",
    sourceNote: "Alternativa qualitativa demonstrativa; desempenho depende do produto e da aplicação.",
  },
  {
    id: "eco-floor-restoration",
    scopeCategory: "floor_installation",
    economicChoiceId: "floor-install-standard",
    ecologicalChoiceId: "floor-restore-eco",
    labelPtBr: "Restaurar o piso existente quando tecnicamente viável",
    rationalePtBr: "Pode reduzir descarte e a necessidade de material novo.",
    tradeoffPtBr: "A viabilidade e o acabamento dependem do estado real do piso, confirmado em vistoria.",
    impactCategories: ["waste", "materials"],
    verificationNotePtBr: "Solicitar inspeção do substrato e teste em pequena área antes de contratar o serviço.",
    sourceNote: "Referência qualitativa alinhada à redução de resíduos; sem alegação numérica.",
  },
  {
    id: "eco-light-led",
    scopeCategory: "lighting_point",
    economicChoiceId: "light-basic",
    ecologicalChoiceId: "light-led",
    labelPtBr: "Solução LED eficiente",
    rationalePtBr: "Pode reduzir o consumo operacional quando potência e uso são adequados ao ambiente.",
    tradeoffPtBr: "Qualidade, durabilidade e conforto visual variam entre produtos.",
    impactCategories: ["energy"],
    verificationNotePtBr: "Confirmar potência, fluxo luminoso, temperatura de cor, garantia e compatibilidade elétrica.",
    sourceNote: "Referência qualitativa baseada em eficiência operacional; economia depende do uso.",
  },
  {
    id: "eco-selective-demolition",
    scopeCategory: "demolition_light",
    economicChoiceId: "demolition-standard",
    ecologicalChoiceId: "demolition-selective",
    labelPtBr: "Remoção seletiva com separação para reaproveitamento",
    rationalePtBr: "Pode facilitar reaproveitamento e destinação separada dos resíduos.",
    tradeoffPtBr: "Exige mais planejamento e pode aumentar o tempo de mão de obra.",
    impactCategories: ["waste", "materials"],
    verificationNotePtBr: "Combinar previamente quais elementos têm condição de reúso e como serão destinados.",
    sourceNote: "Referência qualitativa alinhada à gestão de resíduos da construção.",
  },
] as const satisfies readonly EcoAlternative[];
