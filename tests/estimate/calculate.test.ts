import { describe, expect, it } from "vitest";

import { calculateDualEstimate } from "@/lib/estimate/calculate";
import type { ConfirmedScopeItem } from "@/types";

const scope: ConfirmedScopeItem[] = [
  {
    id: "paint",
    category: "wall_painting",
    labelPtBr: "Pintura de paredes",
    quantity: 10,
    unit: "m2",
    quantitySource: { type: "informed" },
    confirmed: true,
  },
  {
    id: "floor",
    category: "floor_installation",
    labelPtBr: "Instalação de piso",
    quantity: 10,
    unit: "m2",
    quantitySource: { type: "calculated", formulaPtBr: "Área + perda" },
    confirmed: true,
  },
  {
    id: "lights",
    category: "lighting_point",
    labelPtBr: "Pontos de iluminação",
    quantity: 2,
    unit: "unit",
    quantitySource: { type: "informed" },
    confirmed: true,
  },
];

const input = { uf: "SP", finishTier: "standard" as const, scope };

describe("calculateDualEstimate", () => {
  it("uses identical confirmed scope and quantities in both profiles", () => {
    const result = calculateDualEstimate(input);
    const visibleScope = (line: (typeof result.economic.lineItems)[number]) => ({
      id: line.scopeItemId,
      quantity: line.quantity,
      unit: line.unit,
    });

    expect(result.economic.lineItems.map(visibleScope)).toEqual(
      result.ecological.lineItems.map(visibleScope),
    );
    expect(result.comparisons).toHaveLength(3);
    expect(
      result.comparisons.every(
        (comparison) =>
          comparison.rationale.length > 0 &&
          comparison.tradeoff.length > 0 &&
          comparison.verificationNote.length > 0,
      ),
    ).toBe(true);
  });

  it("returns deterministic catalogue-backed totals and ignores injected prices", () => {
    const first = calculateDualEstimate(input);
    const second = calculateDualEstimate(input);
    const injectedPriceInput = {
      ...input,
      scope: scope.map((item) => ({ ...item, modelSuggestedUnitPrice: 0.01 })),
    };

    expect(second).toEqual(first);
    expect(calculateDualEstimate(injectedPriceInput)).toEqual(first);
    expect(first.economic.breakdown).toEqual({
      materials: 670,
      labor: 670,
      direct: 1340,
      contingency: 134,
      overheadBdi: 221.1,
    });
    expect(first.economic.expectedTotal).toBe(1700);
    expect(first.ecological.expectedTotal).toBe(1600);
  });

  it("excludes a missing catalogue item with a visible explanation", () => {
    const unsupported: ConfirmedScopeItem = {
      id: "cabinetry",
      category: "custom_cabinetry",
      labelPtBr: "Marcenaria sob medida",
      quantity: 1,
      unit: "service",
      quantitySource: { type: "informed" },
      confirmed: true,
    };
    const result = calculateDualEstimate({ ...input, scope: [...scope, unsupported] });

    expect(result.economic.lineItems.some((line) => line.scopeItemId === "cabinetry")).toBe(false);
    expect(result.economic.excludedItems).toEqual([
      expect.objectContaining({
        scopeItemId: "cabinetry",
        reasonPtBr: expect.stringContaining("sem preço no catálogo"),
      }),
    ]);
    expect(result.exclusions[0]).toContain("excluído da estimativa automática");
  });
});
