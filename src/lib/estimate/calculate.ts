import {
  COST_CATALOGUE,
  COST_DATASET,
  ECONOMIC_CHOICE_BY_CATEGORY,
  UF_PRICE_FACTORS,
  type CostCatalogueItem,
} from "@/data/costs/catalogue";
import {
  ECO_ALTERNATIVES,
  type EcoAlternative,
} from "@/data/eco/catalogue";
import type {
  ConfirmedScopeItem,
  DualEstimateResponse,
  EstimateProfile,
  EstimateResult,
  FinishTier,
  ScopeCategory,
} from "@/types";

export type EstimateInput = {
  uf: string;
  finishTier: FinishTier;
  scope: readonly ConfirmedScopeItem[];
};

const FINISH_MULTIPLIER: Record<FinishTier, number> = {
  economy: 0.9,
  standard: 1,
  premium: 1.25,
};

const catalogueById = Object.fromEntries(
  COST_CATALOGUE.map((item) => [item.id, item]),
) as Readonly<Record<string, CostCatalogueItem>>;
const ecoByCategory = Object.fromEntries(
  ECO_ALTERNATIVES.map((alternative) => [
    alternative.scopeCategory,
    alternative,
  ]),
) as Partial<Record<ScopeCategory, EcoAlternative>>;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

function calculateProfile(
  input: EstimateInput,
  profile: EstimateProfile,
): EstimateResult {
  const regionalFactor = UF_PRICE_FACTORS[input.uf.toUpperCase()] ?? 1;
  const finishMultiplier = FINISH_MULTIPLIER[input.finishTier];
  const lineItems: EstimateResult["lineItems"] = [];
  const excludedItems: EstimateResult["excludedItems"] = [];

  for (const scopeItem of input.scope) {
    const economicChoiceId = ECONOMIC_CHOICE_BY_CATEGORY[scopeItem.category];
    if (!economicChoiceId) {
      excludedItems.push({
        scopeItemId: scopeItem.id,
        scopeCategory: scopeItem.category,
        reasonPtBr: `${scopeItem.labelPtBr}: item sem preço no catálogo ${COST_DATASET.version}; excluído da estimativa automática.`,
      });
      continue;
    }

    const alternative = ecoByCategory[scopeItem.category];
    const choiceId =
      profile === "ecological" && alternative
        ? alternative.ecologicalChoiceId
        : economicChoiceId;
    const catalogueItem = catalogueById[choiceId];

    if (!catalogueItem || catalogueItem.unit !== scopeItem.unit) {
      excludedItems.push({
        scopeItemId: scopeItem.id,
        scopeCategory: scopeItem.category,
        reasonPtBr: `${scopeItem.labelPtBr}: composição compatível não encontrada no catálogo ${COST_DATASET.version}; excluído da estimativa automática.`,
      });
      continue;
    }

    const materialUnit =
      catalogueItem.baseMaterialUnit * regionalFactor * finishMultiplier;
    const laborUnit = catalogueItem.baseLaborUnit * regionalFactor;
    const materialCost = roundCurrency(scopeItem.quantity * materialUnit);
    const laborCost = roundCurrency(scopeItem.quantity * laborUnit);

    lineItems.push({
      scopeItemId: scopeItem.id,
      scopeCategory: scopeItem.category,
      labelPtBr: scopeItem.labelPtBr,
      quantity: scopeItem.quantity,
      unit: scopeItem.unit,
      catalogueChoiceId: catalogueItem.id,
      catalogueChoiceLabelPtBr: catalogueItem.labelPtBr,
      materialCost,
      laborCost,
      directCost: roundCurrency(materialCost + laborCost),
      isEcologicalAlternative:
        profile === "ecological" && choiceId !== economicChoiceId,
    });
  }

  const materials = roundCurrency(
    lineItems.reduce((total, line) => total + line.materialCost, 0),
  );
  const labor = roundCurrency(
    lineItems.reduce((total, line) => total + line.laborCost, 0),
  );
  const direct = roundCurrency(materials + labor);
  const contingency = roundCurrency(direct * 0.1);
  const overheadBdi = roundCurrency((direct + contingency) * 0.15);
  const rawExpected = direct + contingency + overheadBdi;
  const uncertaintyHigh = Math.min(
    0.35,
    0.15 +
      (input.scope.some((item) => item.quantitySource.type === "assumed")
        ? 0.1
        : 0) +
      (excludedItems.length > 0 ? 0.1 : 0),
  );

  return {
    profile,
    lineItems,
    excludedItems,
    breakdown: { materials, labor, direct, contingency, overheadBdi },
    expectedTotal: roundHundred(rawExpected),
    range: {
      low: roundHundred(rawExpected * 0.9),
      high: roundHundred(rawExpected * (1 + uncertaintyHigh)),
    },
    assumptionsPtBr: [
      COST_DATASET.noticePtBr,
      `Fator regional demonstrativo aplicado para ${input.uf.toUpperCase()}.`,
      "Contingência de 10% e BDI de 15%; totais finais arredondados para R$ 100.",
    ],
  };
}

export function calculateDualEstimate(
  input: EstimateInput,
): DualEstimateResponse {
  const economic = calculateProfile(input, "economic");
  const ecological = calculateProfile(input, "ecological");
  const economicLines = new Map(
    economic.lineItems.map((line) => [line.scopeItemId, line]),
  );

  const comparisons = ecological.lineItems.flatMap((ecologicalLine) => {
    if (!ecologicalLine.isEcologicalAlternative) return [];
    const economicLine = economicLines.get(ecologicalLine.scopeItemId);
    const alternative = ecoByCategory[ecologicalLine.scopeCategory];
    if (!economicLine || !alternative) return [];

    return [
      {
        scopeCategory: ecologicalLine.scopeCategory,
        economicChoice: economicLine.catalogueChoiceLabelPtBr,
        ecologicalChoice: ecologicalLine.catalogueChoiceLabelPtBr,
        upfrontDifference: roundCurrency(
          ecologicalLine.directCost - economicLine.directCost,
        ),
        rationale: alternative.rationalePtBr,
        tradeoff: alternative.tradeoffPtBr,
        impactCategories: [...alternative.impactCategories],
        verificationNote: alternative.verificationNotePtBr,
      },
    ];
  });

  const exclusions = Array.from(
    new Set(
      [...economic.excludedItems, ...ecological.excludedItems].map(
        (item) => item.reasonPtBr,
      ),
    ),
  );

  return {
    datasetVersion: COST_DATASET.version,
    referencePeriod: COST_DATASET.referencePeriod,
    regionalReference: { uf: input.uf.toUpperCase() },
    economic,
    ecological,
    comparisons,
    sharedAssumptions: economic.assumptionsPtBr,
    exclusions,
  };
}
