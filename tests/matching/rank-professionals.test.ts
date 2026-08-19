import { describe, expect, it } from "vitest";

import { rankProfessionals } from "@/lib/matching/rank-professionals";
import type { DemoProfessional } from "@/types";

const professional = (
  { id, ...values }: Partial<DemoProfessional> & Pick<DemoProfessional, "id">,
): DemoProfessional => ({
  id,
  isDemo: true,
  name: `Profissional ${id}`,
  city: "São Paulo",
  uf: "SP",
  specialties: ["Pintura", "Pisos"],
  priceTier: "economy",
  supportsEcoOptions: true,
  availability: "immediate",
  responseTimeLabel: "Responde em até 2 horas",
  rating: 4.8,
  reviewCount: 24,
  portfolioImages: ["/demo/portfolio.webp"],
  ...values,
});

const professionals: DemoProfessional[] = [
  professional({ id: "demo-z" }),
  professional({ id: "demo-b", specialties: ["Pintura"], priceTier: "standard", availability: "within_30_days" }),
  professional({ id: "demo-a" }),
  professional({ id: "demo-c", city: "Campinas", supportsEcoOptions: false }),
];

const request = {
  city: "São Paulo",
  uf: "SP",
  scopeCategories: ["wall_painting", "floor_installation"] as const,
  budgetRange: { low: 8_000, high: 14_000 },
  estimatePreference: "both" as const,
  desiredStart: "within_30_days" as const,
};

describe("rankProfessionals", () => {
  it("returns a stable top three with deterministic tie-breaking", () => {
    const ranked = rankProfessionals(request, professionals);
    const reversed = rankProfessionals(request, [...professionals].reverse());

    expect(ranked.map((match) => match.professional.id)).toEqual([
      "demo-a",
      "demo-z",
      "demo-c",
    ]);
    expect(reversed.map((match) => match.professional.id)).toEqual(
      ranked.map((match) => match.professional.id),
    );
    expect(ranked.map((match) => match.score)).toEqual([100, 100, 78]);
  });

  it("explains the factors behind each returned match", () => {
    const [best] = rankProfessionals(request, professionals);

    expect(best.reasons).toEqual([
      "Atende em São Paulo/SP",
      "Especialidades cobrem todo o escopo confirmado",
      "Compatível com a faixa estimada",
      "Experiência demonstrativa com opções ecológicas",
      "Disponibilidade compatível com o prazo desejado",
    ]);
  });
});
