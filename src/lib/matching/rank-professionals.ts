import type {
  DemoProfessional,
  EstimatePreference,
  MoneyRange,
  ProfessionalMatch,
  ScopeCategory,
} from "@/types";

export type ProfessionalRankingRequest = {
  city: string;
  uf: string;
  scopeCategories: readonly ScopeCategory[];
  budgetRange: MoneyRange;
  estimatePreference: EstimatePreference;
  desiredStart:
    | "urgent"
    | "within_30_days"
    | "one_to_three_months"
    | "researching";
};

const SPECIALTY_TERMS: Partial<Record<ScopeCategory, readonly string[]>> = {
  wall_painting: ["pintura"],
  ceiling_painting: ["pintura"],
  floor_removal: ["piso", "revestimento", "demolicao"],
  floor_installation: ["piso", "revestimento"],
  floor_restoration: ["piso", "restauracao"],
  baseboard_installation: ["rodape", "piso"],
  lighting_point: ["iluminacao", "eletrica"],
  electrical_point: ["eletrica"],
  drywall_partition: ["drywall", "gesso"],
  demolition_light: ["demolicao", "reforma"],
  debris_removal: ["entulho", "demolicao", "reforma"],
  site_protection_cleaning: ["limpeza", "reforma"],
};

const PRICE_TIER_ORDER: Record<DemoProfessional["priceTier"], number> = {
  economy: 0,
  standard: 1,
  premium: 2,
};

const AVAILABILITY_ORDER: Record<DemoProfessional["availability"], number> = {
  immediate: 0,
  within_30_days: 1,
  one_to_three_months: 2,
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function requestedPriceTier(
  range: MoneyRange,
): DemoProfessional["priceTier"] {
  if (range.high <= 15_000) return "economy";
  if (range.low >= 30_000) return "premium";
  return "standard";
}

function availabilityScore(
  professional: DemoProfessional,
  desiredStart: ProfessionalRankingRequest["desiredStart"],
): number {
  if (desiredStart === "researching") return 10;
  const requested =
    desiredStart === "urgent"
      ? 0
      : desiredStart === "within_30_days"
        ? 1
        : 2;
  const difference = AVAILABILITY_ORDER[professional.availability] - requested;
  if (difference <= 0) return 10;
  return difference === 1 ? 5 : 0;
}

export function rankProfessionals(
  request: ProfessionalRankingRequest,
  professionals: readonly DemoProfessional[],
  limit = 3,
): ProfessionalMatch[] {
  const normalizedCity = normalize(request.city);
  const normalizedUf = request.uf.toUpperCase();
  const desiredTier = requestedPriceTier(request.budgetRange);

  return professionals
    .map((professional): ProfessionalMatch => {
      const reasons: string[] = [];
      let score = 0;

      if (
        professional.uf.toUpperCase() === normalizedUf &&
        normalize(professional.city) === normalizedCity
      ) {
        score += 30;
        reasons.push(`Atende em ${professional.city}/${professional.uf.toUpperCase()}`);
      } else if (professional.uf.toUpperCase() === normalizedUf) {
        score += 18;
        reasons.push(`Atende no estado de ${normalizedUf}`);
      }

      const normalizedSpecialties = professional.specialties.map(normalize);
      const matchedCategories = request.scopeCategories.filter((category) =>
        (SPECIALTY_TERMS[category] ?? []).some((term) =>
          normalizedSpecialties.some((specialty) => specialty.includes(term)),
        ),
      );
      if (request.scopeCategories.length > 0 && matchedCategories.length > 0) {
        score += Math.round(
          (matchedCategories.length / request.scopeCategories.length) * 30,
        );
        reasons.push(
          matchedCategories.length === request.scopeCategories.length
            ? "Especialidades cobrem todo o escopo confirmado"
            : "Especialidades cobrem parte do escopo confirmado",
        );
      }

      const tierDistance = Math.abs(
        PRICE_TIER_ORDER[professional.priceTier] - PRICE_TIER_ORDER[desiredTier],
      );
      if (tierDistance === 0) {
        score += 20;
        reasons.push("Compatível com a faixa estimada");
      } else if (tierDistance === 1) {
        score += 10;
        reasons.push("Faixa de atuação próxima da estimativa");
      }

      if (request.estimatePreference === "economic") {
        score += 10;
      } else if (professional.supportsEcoOptions) {
        score += 10;
        reasons.push("Experiência demonstrativa com opções ecológicas");
      }

      const timingScore = availabilityScore(professional, request.desiredStart);
      score += timingScore;
      if (timingScore === 10) {
        reasons.push("Disponibilidade compatível com o prazo desejado");
      }

      return { professional, score, reasons };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.professional.id < right.professional.id) return -1;
      if (left.professional.id > right.professional.id) return 1;
      return 0;
    })
    .slice(0, Math.max(0, limit));
}
