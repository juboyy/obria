import assert from "node:assert/strict";
import test from "node:test";

import {
  createProductResearchReport,
  deduplicateProductOffers,
  matchRequiredTermGroups,
  normalizeProductText,
} from "./product-research.ts";

const NOW = "2026-08-19T12:00:00.000Z";
const PERIOD_START = "2026-08-01T00:00:00.000Z";
const PERIOD_END = "2026-12-31T23:59:59.000Z";

function offer(offerId, productName, unitPriceCents, overrides = {}) {
  return {
    offerId,
    provider: "REPLAY",
    itemId: offerId,
    shopId: "replay-shop",
    shopName: "Loja de replay",
    productName,
    productUrl: `https://shopee.com.br/product/${offerId}`,
    offerUrl: `https://shopee.com.br/offer/${offerId}`,
    unitPriceCents: { low: unitPriceCents, high: unitPriceCents },
    sales: 10,
    rating: 4.8,
    periodStartAt: PERIOD_START,
    periodEndAt: PERIOD_END,
    collectedAt: NOW,
    matchedTerms: [],
    ...overrides,
  };
}

const lightNeed = {
  id: "light",
  catalogKey: "LIGHT_POINT",
  label: "Luminária LED quente",
  searchQuery: "luminária LED 2700K",
  requiredTermGroups: [["luminária", "abajur"], ["LED"]],
  quantity: 2,
  constraints: ["Confirmar tensão e soquete"],
};
const rugNeed = {
  id: "rug",
  catalogKey: "RUG",
  label: "Tapete da sala",
  searchQuery: "tapete sala 200x150 lavável",
  requiredTermGroups: [["tapete"], ["sala"]],
  quantity: 1,
  constraints: ["Confirmar dimensão e manutenção"],
};
const tableNeed = {
  id: "table",
  catalogKey: "SIDE_TABLE",
  label: "Mesa lateral",
  searchQuery: "mesa lateral madeira sala",
  requiredTermGroups: [["mesa"], ["lateral", "apoio"]],
  quantity: 1,
  constraints: ["Confirmar circulação e reparabilidade"],
};

test("normaliza acentos e exige ao menos um termo de cada grupo", () => {
  assert.equal(normalizeProductText("  LUMINÁRIA—LED  "), "luminaria led");
  assert.deepEqual(
    matchRequiredTermGroups("Abajur decorativo com lâmpada LED", lightNeed.requiredTermGroups),
    { matches: true, matchedTerms: ["abajur", "LED"] },
  );
  assert.deepEqual(
    matchRequiredTermGroups("Mesa de jantar", tableNeed.requiredTermGroups),
    { matches: false, matchedTerms: ["mesa"] },
  );
});

test("deduplica por provedor, loja e item de forma determinística", () => {
  const expensive = offer("listing-a", "Tapete sala lavável", 21990, {
    itemId: "same-item",
    rating: 5,
  });
  const cheap = offer("listing-b", "Tapete sala lavável", 19990, {
    itemId: "same-item",
    rating: 4,
  });
  const otherShop = offer("listing-c", "Tapete sala lavável", 18990, {
    itemId: "same-item",
    shopId: "other-shop",
  });

  assert.deepEqual(
    deduplicateProductOffers([expensive, otherShop, cheap]).map(({ offerId }) => offerId),
    ["listing-c", "listing-b"],
  );
});

test("produz os três caminhos replay com regras fechadas por categoria", () => {
  const offersByNeed = {
    light: [
      offer("light-low", "Luminária LED 9W 720lm 2700K", 7990),
      offer("light-efficient", "Luminária LED 8W 800lm 2700K", 10990),
      offer("irrelevant-light", "Lâmpada halógena 50W", 2990),
    ],
    rug: [
      offer("rug-low", "Tapete para sala 200x150 poliéster", 14990),
      offer("rug-efficient", "Tapete para sala 200x150 lavável", 21990),
      offer("rug-sustainable", "Tapete para sala 200x150 material reciclado", 26990),
    ],
    table: [
      offer("table-low", "Mesa lateral de apoio MDF", 8990),
      offer("table-efficient", "Mesa lateral dobrável com armazenamento", 14990),
      offer("table-sustainable", "Mesa lateral madeira certificada FSC", 22990),
    ],
  };
  const report = createProductResearchReport({
    projectId: "project-1",
    versionId: "version-1",
    providerMode: "REPLAY",
    collectedAt: NOW,
    sourceNoticePtBr: "DADOS DE REPLAY — NÃO SÃO PREÇOS ATUAIS.",
    productNeeds: [lightNeed, rugNeed, tableNeed],
    offersByNeed,
  });

  assert.equal(report.results[0].offers.length, 2, "oferta irrelevante deve ser descartada");
  assert.deepEqual(
    report.results.map(({ paths }) => paths.map(({ kind }) => kind)),
    Array(3).fill(["LOWEST_UPFRONT", "BEST_USE_EFFICIENCY", "MOST_SUSTAINABLE"]),
  );

  const lightPaths = report.results[0].paths;
  assert.equal(lightPaths[0].offerId, "light-low");
  assert.equal(lightPaths[1].offerId, "light-efficient");
  assert.equal(lightPaths[1].status, "AVAILABLE_WITH_VERIFICATION");
  assert.match(lightPaths[1].evidence[0].claimPtBr, /100 lm\/W/);
  assert.equal(lightPaths[2].offerId, "light-efficient");
  assert.equal(lightPaths[2].status, "AVAILABLE_WITH_VERIFICATION");

  const rugPaths = report.results[1].paths;
  assert.equal(rugPaths[1].offerId, "rug-efficient");
  assert.equal(rugPaths[2].offerId, "rug-sustainable");

  const tablePaths = report.results[2].paths;
  assert.equal(tablePaths[1].offerId, "table-efficient");
  assert.equal(tablePaths[2].offerId, "table-sustainable");

  for (const result of report.results) {
    for (const path of result.paths) {
      assert.equal("ecoScore" in path, false);
      assert.equal("estimatedSavingsCents" in path, false);
      for (const evidence of path.evidence) assert.match(evidence.sourceUrl, /^https:\/\//);
    }
  }
});

test("sem oferta relevante falha fechado com NO_MATCH nos três caminhos", () => {
  const report = createProductResearchReport({
    projectId: "project-2",
    versionId: "version-2",
    providerMode: "REPLAY",
    collectedAt: NOW,
    sourceNoticePtBr: "DADOS DE REPLAY — NÃO SÃO PREÇOS ATUAIS.",
    productNeeds: [tableNeed],
    offersByNeed: { table: [offer("wrong", "Mesa de jantar extensível", 9990)] },
  });

  const result = report.results[0];
  assert.equal(result.marketRangeCents, null);
  assert.equal(result.offers.length, 0);
  assert.deepEqual(result.paths.map(({ status }) => status), ["NO_MATCH", "NO_MATCH", "NO_MATCH"]);
  assert.ok(result.paths.every(({ offerId, upfrontDifferenceCents }) => offerId === null && upfrontDifferenceCents === null));
});
