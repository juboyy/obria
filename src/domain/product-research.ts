import { z } from "zod";

// Explicit extension keeps this module runnable by Node's native TypeScript test support.
// @ts-ignore allowImportingTsExtensions is intentionally not enabled project-wide
import { DecisionPathKindSchema, ProductCatalogKey, ProductNeedSchema, type ProductNeed } from "./obria.ts";

export { DecisionPathKindSchema, ProductCatalogKey, ProductNeedSchema };
export type { ProductNeed };
export type DecisionPathKind = z.infer<typeof DecisionPathKindSchema>;

const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), "A URL deve usar HTTPS");
const isoDateTime = z.string().datetime({ offset: true });

export const MoneyRangeCentsSchema = z.object({
  low: z.number().int().nonnegative(),
  high: z.number().int().nonnegative(),
}).strict().superRefine(({ low, high }, context) => {
  if (high < low) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["high"],
      message: "high deve ser maior ou igual a low",
    });
  }
});
export type MoneyRangeCents = z.infer<typeof MoneyRangeCentsSchema>;

export const ProductOfferProviderSchema = z.enum(["SHOPEE_AFFILIATE", "REPLAY"]);
export type ProductOfferProvider = z.infer<typeof ProductOfferProviderSchema>;

export const ProductOfferSchema = z.object({
  offerId: z.string().min(1).max(200),
  provider: ProductOfferProviderSchema,
  itemId: z.string().min(1).max(200),
  shopId: z.string().min(1).max(200),
  shopName: z.string().min(1).max(300),
  productName: z.string().min(1).max(500),
  productUrl: httpsUrl,
  offerUrl: httpsUrl,
  imageUrl: httpsUrl.optional(),
  unitPriceCents: MoneyRangeCentsSchema,
  sales: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  periodStartAt: isoDateTime,
  periodEndAt: isoDateTime,
  collectedAt: isoDateTime,
  matchedTerms: z.array(z.string().min(1).max(30)).max(4),
}).strict().superRefine(({ periodStartAt, periodEndAt }, context) => {
  if (Date.parse(periodEndAt) < Date.parse(periodStartAt)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["periodEndAt"],
      message: "periodEndAt deve ser posterior ou igual a periodStartAt",
    });
  }
});
export type ProductOffer = z.infer<typeof ProductOfferSchema>;

export const DecisionPathStatusSchema = z.enum([
  "AVAILABLE",
  "AVAILABLE_WITH_VERIFICATION",
  "NEEDS_VERIFICATION",
  "NO_MATCH",
]);
export type DecisionPathStatus = z.infer<typeof DecisionPathStatusSchema>;

export const ProductDecisionEvidenceSchema = z.object({
  claimPtBr: z.string().min(1).max(500),
  sourceUrl: httpsUrl,
}).strict();
export type ProductDecisionEvidence = z.infer<typeof ProductDecisionEvidenceSchema>;

export const ProductDecisionPathSchema = z.object({
  kind: DecisionPathKindSchema,
  status: DecisionPathStatusSchema,
  offerId: z.string().min(1).max(200).nullable(),
  whatChangesPtBr: z.string().min(1).max(500),
  whyItMayHelpPtBr: z.string().min(1).max(500),
  upfrontDifferenceCents: z.number().int().nonnegative().nullable(),
  tradeoffPtBr: z.string().min(1).max(500),
  whatToVerifyPtBr: z.array(z.string().min(1).max(300)).max(12),
  evidence: z.array(ProductDecisionEvidenceSchema).max(8),
}).strict().superRefine(({ status, offerId, upfrontDifferenceCents, evidence }, context) => {
  const available = status === "AVAILABLE" || status === "AVAILABLE_WITH_VERIFICATION";
  if (available && offerId === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["offerId"], message: "offerId é obrigatório para caminho disponível" });
  }
  if (!available && offerId !== null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["offerId"], message: "offerId deve ser nulo para caminho indisponível" });
  }
  if (available && upfrontDifferenceCents === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["upfrontDifferenceCents"], message: "A diferença de preço é obrigatória para caminho disponível" });
  }
  if (!available && upfrontDifferenceCents !== null) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["upfrontDifferenceCents"], message: "A diferença de preço deve ser nula para caminho indisponível" });
  }
  if (available && evidence.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["evidence"], message: "Caminho disponível exige evidência ligada à oferta" });
  }
});
export type ProductDecisionPath = z.infer<typeof ProductDecisionPathSchema>;

const PathsSchema = z.array(ProductDecisionPathSchema).length(3).superRefine((paths, context) => {
  const kinds = new Set(paths.map(({ kind }) => kind));
  for (const kind of DecisionPathKindSchema.options) {
    if (!kinds.has(kind)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: `Caminho ausente: ${kind}` });
    }
  }
});

export const ProductNeedResearchSchema = z.object({
  need: ProductNeedSchema,
  offers: z.array(ProductOfferSchema),
  marketRangeCents: MoneyRangeCentsSchema.nullable(),
  paths: PathsSchema,
}).strict().superRefine(({ offers, marketRangeCents, paths }, context) => {
  if ((offers.length === 0) !== (marketRangeCents === null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["marketRangeCents"], message: "A faixa de mercado deve refletir as ofertas relevantes" });
  }
  const offerIds = new Set(offers.map(({ offerId }) => offerId));
  paths.forEach((path, index) => {
    if (path.offerId !== null && !offerIds.has(path.offerId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", index, "offerId"], message: "O caminho deve apontar para uma oferta do resultado" });
    }
  });
});
export type ProductNeedResearch = z.infer<typeof ProductNeedResearchSchema>;

const ProductResearchMetadataSchema = z.object({
  projectId: z.string().min(1).max(200),
  versionId: z.string().min(1).max(200),
  providerMode: z.enum(["LIVE", "REPLAY"]),
  collectedAt: isoDateTime,
  sourceNoticePtBr: z.string().min(1).max(800),
}).strict();

export const ProductResearchReportSchema = ProductResearchMetadataSchema.extend({
  results: z.array(ProductNeedResearchSchema).min(1).max(8),
}).superRefine(({ results }, context) => {
  const ids = new Set<string>();
  results.forEach(({ need }, index) => {
    if (ids.has(need.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["results", index, "need", "id"], message: "Cada necessidade deve aparecer uma única vez" });
    }
    ids.add(need.id);
  });
});
export type ProductResearchReport = z.infer<typeof ProductResearchReportSchema>;

export const ProductSelectionSchema = z.object({
  needId: z.string().min(1).max(80),
  path: DecisionPathKindSchema,
  offerId: z.string().min(1).max(200),
  selectedAt: isoDateTime,
}).strict();
export type ProductSelection = z.infer<typeof ProductSelectionSchema>;

export const ProductSelectionChoiceSchema = z.object({
  needId: z.string().min(1).max(80),
  path: DecisionPathKindSchema,
}).strict();
export type ProductSelectionChoice = z.infer<typeof ProductSelectionChoiceSchema>;

export const ProductSelectionRequestSchema = z.object({
  expectedRevision: z.number().int().nonnegative(),
  selections: z.array(ProductSelectionChoiceSchema).min(1).max(8),
}).strict().superRefine(({ selections }, context) => {
  const ids = new Set<string>();
  selections.forEach(({ needId }, index) => {
    if (ids.has(needId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["selections", index, "needId"], message: "Cada necessidade pode ser escolhida uma única vez" });
    }
    ids.add(needId);
  });
});
export type ProductSelectionRequest = z.infer<typeof ProductSelectionRequestSchema>;

export function normalizeProductText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function includesNormalizedPhrase(normalizedText: string, phrase: string): boolean {
  const normalizedPhrase = normalizeProductText(phrase);
  return normalizedPhrase.length > 0 && ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}

export function matchRequiredTermGroups(
  productName: string,
  requiredTermGroups: string[][],
): { matches: boolean; matchedTerms: string[] } {
  const normalizedName = normalizeProductText(productName);
  const matchedTerms: string[] = [];
  for (const group of requiredTermGroups) {
    const match = group.find((term) => includesNormalizedPhrase(normalizedName, term));
    if (match === undefined) return { matches: false, matchedTerms };
    matchedTerms.push(match);
  }
  return { matches: true, matchedTerms };
}

function compareOffers(left: ProductOffer, right: ProductOffer): number {
  return left.unitPriceCents.low - right.unitPriceCents.low
    || left.unitPriceCents.high - right.unitPriceCents.high
    || right.rating - left.rating
    || right.sales - left.sales
    || left.offerId.localeCompare(right.offerId);
}

export function deduplicateProductOffers(offers: ProductOffer[]): ProductOffer[] {
  const byListing = new Map<string, ProductOffer>();
  for (const offer of offers) {
    const key = `${offer.provider}\u0000${offer.shopId}\u0000${offer.itemId}`;
    const current = byListing.get(key);
    if (current === undefined || compareOffers(offer, current) < 0) byListing.set(key, offer);
  }
  return [...byListing.values()].sort(compareOffers);
}

export function calculateMarketRangeCents(offers: ProductOffer[]): MoneyRangeCents | null {
  if (offers.length === 0) return null;
  let low = offers[0].unitPriceCents.low;
  let high = offers[0].unitPriceCents.high;
  for (let index = 1; index < offers.length; index += 1) {
    low = Math.min(low, offers[index].unitPriceCents.low);
    high = Math.max(high, offers[index].unitPriceCents.high);
  }
  return { low, high };
}

export function calculateUpfrontDifferenceCents(offer: ProductOffer, lowestOffer: ProductOffer): number {
  return Math.max(0, offer.unitPriceCents.low - lowestOffer.unitPriceCents.low);
}

export type LightingLumensPerWatt = {
  lumens: number;
  watts: number;
  lumensPerWatt: number;
};

export function extractLightingLumensPerWatt(productName: string): LightingLumensPerWatt | null {
  const normalized = productName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/(\d),(\d)/g, "$1.$2");
  const wattsMatch = normalized.match(/(\d+(?:\.\d+)?)\s*w(?:att(?:s)?)?\b/);
  const lumensMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:lm|lumen(?:s)?)\b/);
  if (wattsMatch === null || lumensMatch === null) return null;
  const watts = Number(wattsMatch[1]);
  const lumens = Number(lumensMatch[1]);
  if (!Number.isFinite(watts) || !Number.isFinite(lumens) || watts <= 0 || lumens <= 0) return null;
  return { lumens, watts, lumensPerWatt: Number((lumens / watts).toFixed(2)) };
}

const RUG_MAINTENANCE_EVIDENCE = [
  "lavável", "lavavel", "fácil de limpar", "facil de limpar", "fácil limpeza", "facil limpeza",
  "limpeza fácil", "limpeza facil", "lavagem em máquina", "lavagem em maquina",
];
const RECYCLED_OR_REUSED_EVIDENCE = [
  "material reciclado", "material reciclada", "materiais reciclados", "materiais recicladas",
  "material reaproveitado", "material reaproveitada", "materiais reaproveitados", "materiais reaproveitadas",
  "fibra reciclada", "fibras recicladas", "plástico reciclado", "plastico reciclado",
  "global recycled standard", "certificado grs", "certificada grs", "certificação grs", "certificacao grs",
];
const SIDE_TABLE_FUNCTION_EVIDENCE = [
  "dobrável", "dobravel", "com armazenamento", "armazenamento", "multifuncional", "multiuso", "2 em 1",
];
const CERTIFIED_WOOD_EVIDENCE = [
  "madeira certificada", "madeira de manejo certificado", "certificado fsc", "certificada fsc", "selo fsc",
];

function firstTextEvidence(productName: string, terms: string[]): string | null {
  const normalizedName = normalizeProductText(productName);
  return terms.find((term) => includesNormalizedPhrase(normalizedName, term)) ?? null;
}

function evidence(claimPtBr: string, offer: ProductOffer): ProductDecisionEvidence[] {
  return [{ claimPtBr, sourceUrl: offer.offerUrl }];
}

function unavailablePath(
  kind: DecisionPathKind,
  status: "NEEDS_VERIFICATION" | "NO_MATCH",
  copy: Pick<ProductDecisionPath, "whatChangesPtBr" | "whyItMayHelpPtBr" | "tradeoffPtBr" | "whatToVerifyPtBr">,
): ProductDecisionPath {
  return { kind, status, offerId: null, upfrontDifferenceCents: null, evidence: [], ...copy };
}

function noMatchPath(kind: DecisionPathKind): ProductDecisionPath {
  return unavailablePath(kind, "NO_MATCH", {
    whatChangesPtBr: "Nenhuma oferta relevante foi encontrada para esta necessidade.",
    whyItMayHelpPtBr: "Evita recomendar um produto que não atende aos termos obrigatórios.",
    tradeoffPtBr: "É necessário refazer a pesquisa ou revisar os termos da necessidade.",
    whatToVerifyPtBr: ["Confirme descrição, medidas e compatibilidade antes de uma nova escolha."],
  });
}

function lowestPath(lowest: ProductOffer): ProductDecisionPath {
  return {
    kind: "LOWEST_UPFRONT",
    status: "AVAILABLE",
    offerId: lowest.offerId,
    whatChangesPtBr: "Prioriza o menor preço inicial anunciado entre as ofertas relevantes.",
    whyItMayHelpPtBr: "Reduz o desembolso inicial observado sem presumir frete, estoque ou promoção.",
    upfrontDifferenceCents: 0,
    tradeoffPtBr: "O menor preço não comprova melhor durabilidade, manutenção ou impacto ambiental.",
    whatToVerifyPtBr: ["Confirme opção, quantidade, frete, estoque, prazo e preço final antes da compra."],
    evidence: evidence(`Preço anunciado a partir de ${lowest.unitPriceCents.low} centavos na oferta.`, lowest),
  };
}

function bestLightingEfficiency(offers: ProductOffer[]): { offer: ProductOffer; metric: LightingLumensPerWatt } | null {
  const candidates = offers.flatMap((offer) => {
    const metric = extractLightingLumensPerWatt(offer.productName);
    return metric === null ? [] : [{ offer, metric }];
  });
  candidates.sort((left, right) => {
    const ratioOrder = right.metric.lumens * left.metric.watts - left.metric.lumens * right.metric.watts;
    return ratioOrder || compareOffers(left.offer, right.offer);
  });
  return candidates[0] ?? null;
}

function evidenceCandidate(
  offers: ProductOffer[],
  terms: string[],
): { offer: ProductOffer; matchedEvidence: string } | null {
  for (const offer of offers) {
    const matchedEvidence = firstTextEvidence(offer.productName, terms);
    if (matchedEvidence !== null) return { offer, matchedEvidence };
  }
  return null;
}

function availableEvidencePath(
  kind: "BEST_USE_EFFICIENCY" | "MOST_SUSTAINABLE",
  offer: ProductOffer,
  lowest: ProductOffer,
  copy: Pick<ProductDecisionPath, "whatChangesPtBr" | "whyItMayHelpPtBr" | "tradeoffPtBr" | "whatToVerifyPtBr">,
  claimPtBr: string,
): ProductDecisionPath {
  return {
    kind,
    status: "AVAILABLE_WITH_VERIFICATION",
    offerId: offer.offerId,
    upfrontDifferenceCents: calculateUpfrontDifferenceCents(offer, lowest),
    evidence: evidence(claimPtBr, offer),
    ...copy,
  };
}

function lightingPaths(offers: ProductOffer[], lowest: ProductOffer): ProductDecisionPath[] {
  const candidate = bestLightingEfficiency(offers);
  if (candidate === null) {
    const copy = {
      whatChangesPtBr: "Não há dados suficientes no título para comparar eficiência de uso.",
      whyItMayHelpPtBr: "A comparação exige potência em watts e fluxo luminoso em lúmens.",
      tradeoffPtBr: "Sem os dois valores, qualquer conclusão de eficiência ou sustentabilidade seria inventada.",
      whatToVerifyPtBr: ["Confirme watts, lúmens, tensão, soquete, embalagem e selo aplicável."],
    };
    return [
      unavailablePath("BEST_USE_EFFICIENCY", "NEEDS_VERIFICATION", copy),
      unavailablePath("MOST_SUSTAINABLE", "NEEDS_VERIFICATION", {
        ...copy,
        whatChangesPtBr: "Não há evidência suficiente para apontar potencial de menor consumo operacional.",
      }),
    ];
  }
  const { offer, metric } = candidate;
  const metricClaim = `${metric.lumens} lm e ${metric.watts} W informados no título (${metric.lumensPerWatt} lm/W); confirme na embalagem.`;
  return [
    availableEvidencePath("BEST_USE_EFFICIENCY", offer, lowest, {
      whatChangesPtBr: "Prioriza a maior relação entre lúmens informados e watts informados.",
      whyItMayHelpPtBr: "Mais lúmens por watt pode entregar mais luz para a potência declarada.",
      tradeoffPtBr: "Dados do título não substituem a embalagem e não permitem calcular economia, vida útil ou carbono.",
      whatToVerifyPtBr: ["Confirme lúmens e watts na embalagem.", "Confirme tensão, soquete e selo aplicável."],
    }, metricClaim),
    availableEvidencePath("MOST_SUSTAINABLE", offer, lowest, {
      whatChangesPtBr: "Usa a mesma evidência de lúmens por watt apenas como potencial de menor consumo operacional.",
      whyItMayHelpPtBr: "A relação declarada pode indicar uso mais eficiente de energia, após confirmação.",
      tradeoffPtBr: "Não comprova origem de materiais, reciclabilidade, durabilidade, economia financeira ou redução de carbono.",
      whatToVerifyPtBr: ["Confirme lúmens e watts na embalagem.", "Confirme tensão, soquete, selo aplicável, materiais e descarte."],
    }, metricClaim),
  ];
}

function rugPaths(offers: ProductOffer[], lowest: ProductOffer): ProductDecisionPath[] {
  const maintenance = evidenceCandidate(offers, RUG_MAINTENANCE_EVIDENCE);
  const sustainable = evidenceCandidate(offers, RECYCLED_OR_REUSED_EVIDENCE);
  const efficiencyPath = maintenance === null
    ? unavailablePath("BEST_USE_EFFICIENCY", "NEEDS_VERIFICATION", {
      whatChangesPtBr: "Nenhuma oferta relevante informa manutenção simples no título.",
      whyItMayHelpPtBr: "Lavabilidade ou facilidade de limpeza precisa de evidência explícita.",
      tradeoffPtBr: "Não é possível presumir manutenção, resistência ou vida útil pelo preço.",
      whatToVerifyPtBr: ["Confirme instruções de lavagem, secagem, medidas e composição na etiqueta."],
    })
    : availableEvidencePath("BEST_USE_EFFICIENCY", maintenance.offer, lowest, {
      whatChangesPtBr: "Prioriza evidência textual de manutenção mais simples.",
      whyItMayHelpPtBr: "A manutenção informada pode facilitar o uso cotidiano, após confirmação.",
      tradeoffPtBr: "A alegação do título não comprova resistência, vida útil ou custo total de manutenção.",
      whatToVerifyPtBr: ["Confirme instruções de lavagem, secagem, medidas e composição na etiqueta."],
    }, `O título da oferta informa “${maintenance.matchedEvidence}”; confirme na etiqueta do produto.`);
  const sustainablePath = sustainable === null
    ? unavailablePath("MOST_SUSTAINABLE", "NEEDS_VERIFICATION", {
      whatChangesPtBr: "Nenhuma oferta relevante traz alegação explícita de material reciclado, reaproveitado ou certificação reconhecível.",
      whyItMayHelpPtBr: "Sem alegação identificável, não há base para uma preferência ambiental.",
      tradeoffPtBr: "Não se presume sustentabilidade por material, aparência, preço ou loja.",
      whatToVerifyPtBr: ["Confirme composição, percentual declarado, certificação e rastreabilidade na etiqueta."],
    })
    : availableEvidencePath("MOST_SUSTAINABLE", sustainable.offer, lowest, {
      whatChangesPtBr: "Prioriza uma alegação explícita de material reciclado, reaproveitado ou certificação.",
      whyItMayHelpPtBr: "A alegação pode apoiar uma escolha de material, mas ainda precisa ser comprovada.",
      tradeoffPtBr: "O título não comprova percentual, origem, durabilidade, carbono ou impacto total.",
      whatToVerifyPtBr: ["Confirme composição, percentual declarado, certificação e rastreabilidade na etiqueta."],
    }, `O título da oferta informa “${sustainable.matchedEvidence}”; confirme no produto ou certificado.`);
  return [efficiencyPath, sustainablePath];
}

function sideTablePaths(offers: ProductOffer[], lowest: ProductOffer): ProductDecisionPath[] {
  const functional = evidenceCandidate(offers, SIDE_TABLE_FUNCTION_EVIDENCE);
  const sustainable = evidenceCandidate(offers, [...RECYCLED_OR_REUSED_EVIDENCE, ...CERTIFIED_WOOD_EVIDENCE]);
  const efficiencyPath = functional === null
    ? unavailablePath("BEST_USE_EFFICIENCY", "NEEDS_VERIFICATION", {
      whatChangesPtBr: "Nenhuma oferta relevante informa função adicional no título.",
      whyItMayHelpPtBr: "Dobrável, armazenamento ou multifuncionalidade exigem evidência explícita.",
      tradeoffPtBr: "Não é possível presumir função, estabilidade ou adequação ao espaço pela imagem ou preço.",
      whatToVerifyPtBr: ["Confirme dimensões, capacidade, estabilidade, montagem e circulação disponível."],
    })
    : availableEvidencePath("BEST_USE_EFFICIENCY", functional.offer, lowest, {
      whatChangesPtBr: "Prioriza uma função adicional informada para o uso do espaço.",
      whyItMayHelpPtBr: "A função declarada pode melhorar o aproveitamento cotidiano, após confirmação.",
      tradeoffPtBr: "A função no título não comprova estabilidade, capacidade, durabilidade ou reparabilidade.",
      whatToVerifyPtBr: ["Confirme dimensões, capacidade, estabilidade, montagem e circulação disponível."],
    }, `O título da oferta informa “${functional.matchedEvidence}”; confirme a função e as dimensões.`);
  const sustainablePath = sustainable === null
    ? unavailablePath("MOST_SUSTAINABLE", "NEEDS_VERIFICATION", {
      whatChangesPtBr: "Nenhuma oferta relevante traz material reciclado, reaproveitado ou madeira certificada no título.",
      whyItMayHelpPtBr: "Sem alegação identificável, não há base para uma preferência de material.",
      tradeoffPtBr: "Não se presume sustentabilidade por aparência de madeira, preço ou loja.",
      whatToVerifyPtBr: ["Confirme material, origem, certificação, reparabilidade e descarte."],
    })
    : availableEvidencePath("MOST_SUSTAINABLE", sustainable.offer, lowest, {
      whatChangesPtBr: "Prioriza alegação explícita de material reciclado, reaproveitado ou madeira certificada.",
      whyItMayHelpPtBr: "A alegação pode orientar a escolha do material, mas precisa ser comprovada.",
      tradeoffPtBr: "O título não comprova origem, percentual, durabilidade, carbono ou impacto total.",
      whatToVerifyPtBr: ["Confirme material, origem, certificação, reparabilidade e descarte."],
    }, `O título da oferta informa “${sustainable.matchedEvidence}”; confirme no produto ou certificado.`);
  return [efficiencyPath, sustainablePath];
}

function createPaths(need: ProductNeed, offers: ProductOffer[]): ProductDecisionPath[] {
  if (offers.length === 0) return DecisionPathKindSchema.options.map(noMatchPath);
  const lowest = offers[0];
  const categoryPaths = need.catalogKey === "LIGHT_POINT"
    ? lightingPaths(offers, lowest)
    : need.catalogKey === "RUG"
      ? rugPaths(offers, lowest)
      : sideTablePaths(offers, lowest);
  return [lowestPath(lowest), ...categoryPaths];
}

export type CreateProductResearchReportInput = {
  projectId: string;
  versionId: string;
  providerMode: "LIVE" | "REPLAY";
  collectedAt: string;
  sourceNoticePtBr: string;
  productNeeds: ProductNeed[];
  offersByNeed: Record<string, ProductOffer[]>;
};

export function createProductResearchReport(input: CreateProductResearchReportInput): ProductResearchReport {
  const metadata = ProductResearchMetadataSchema.parse({
    projectId: input.projectId,
    versionId: input.versionId,
    providerMode: input.providerMode,
    collectedAt: input.collectedAt,
    sourceNoticePtBr: input.sourceNoticePtBr,
  });
  const productNeeds = z.array(ProductNeedSchema).min(1).max(8).parse(input.productNeeds);
  const seenNeedIds = new Set<string>();
  const results = productNeeds.map((need): ProductNeedResearch => {
    if (seenNeedIds.has(need.id)) throw new Error(`Necessidade duplicada: ${need.id}`);
    seenNeedIds.add(need.id);
    const suppliedOffers = ProductOfferSchema.array().parse(input.offersByNeed[need.id] ?? []);
    const relevantOffers = suppliedOffers.flatMap((offer) => {
      const match = matchRequiredTermGroups(offer.productName, need.requiredTermGroups);
      return match.matches ? [{ ...offer, matchedTerms: match.matchedTerms }] : [];
    });
    const offers = deduplicateProductOffers(relevantOffers);
    return ProductNeedResearchSchema.parse({
      need,
      offers,
      marketRangeCents: calculateMarketRangeCents(offers),
      paths: createPaths(need, offers),
    });
  });
  return ProductResearchReportSchema.parse({ ...metadata, results });
}
