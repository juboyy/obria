import { invariant, printSuccess, request } from "./_http.mjs";

const mode = (process.argv[2] ?? process.env.OBRIA_PRODUCT_SMOKE_MODE ?? "replay").toLowerCase();
invariant(["replay", "live", "missing-credentials"].includes(mode), "Mode must be replay, live, or missing-credentials");

const reset = await request("/api/demo", { method: "POST" });
const ready = reset.versions.find((version) => version.state === "READY");
invariant(ready, "Reset state has no READY design version");

await request(`/api/projects/${reset.project.id}/approve`, {
  method: "POST",
  body: { versionId: ready.id, expectedRevision: reset.project.revision },
});
const approved = await request("/api/demo");
invariant(approved.project.state === "PLAN_APPROVED", `Approval left project in ${approved.project.state}`);

if (mode === "missing-credentials") {
  await request(`/api/projects/${approved.project.id}/product-research`, {
    method: "POST",
    body: { expectedRevision: approved.project.revision },
    expectedStatus: 503,
  });
  printSuccess("product-research:smoke", "missing Shopee credentials fail closed with HTTP 503");
  process.exit(0);
}

await request(`/api/projects/${approved.project.id}/product-research`, {
  method: "POST",
  body: { expectedRevision: approved.project.revision },
});
const researched = await request("/api/demo");
const report = researched.productResearch;
invariant(report?.results?.length, "Research report was not persisted");
invariant(report.providerMode === mode.toUpperCase(), `Expected ${mode.toUpperCase()} provider mode, received ${report.providerMode}`);

const selections = report.results.map((result) => {
  const lowest = result.paths.find((path) => path.kind === "LOWEST_UPFRONT" && (path.status === "AVAILABLE" || path.status === "AVAILABLE_WITH_VERIFICATION"));
  invariant(lowest?.offerId, `Need ${result.need.id} has no selectable LOWEST_UPFRONT path`);
  return { needId: result.need.id, path: lowest.kind };
});
await request(`/api/projects/${researched.project.id}/product-research`, {
  method: "PATCH",
  body: { expectedRevision: researched.project.revision, selections },
});
const selected = await request("/api/demo");
invariant(selected.project.state === "READY_TO_SHARE", `Selection left project in ${selected.project.state}`);
invariant(selected.productSelections.length === selections.length, "Not every researched need was selected");

await request(`/api/projects/${selected.project.id}/publish`, { method: "POST" });
const supplier = await request("/api/demo", { role: "SUPPLIER" });
const opportunity = supplier.opportunity;
invariant(opportunity?.status === "OPEN", "Published opportunity is not visible to supplier");
invariant(opportunity.workQuantities.length > 0, "Published opportunity has no work quantities");
invariant(opportunity.selectedProducts.length === selections.length, "Published opportunity omitted selected products");
invariant(opportunity.laborPricing === "SUPPLIER_QUOTE_REQUIRED", "Opportunity does not require supplier labor pricing");

const lines = opportunity.workQuantities.map((item) => ({
  catalogKey: item.catalogKey,
  quantityMilli: item.quantityMilli,
  laborPriceCents: Math.max(25_000, Math.round(item.quantityMilli / 1000) * 5_000),
  note: "mão de obra e instalação",
}));
const proposal = await request(`/api/opportunities/${opportunity.id}/proposals`, {
  method: "POST",
  role: "SUPPLIER",
  expectedStatus: 201,
  body: {
    lines,
    freightCents: 18_000,
    taxCents: 72_000,
    leadDays: 18,
    validUntil: "2026-09-03T12:00:00.000Z",
    includes: ["mão de obra", "montagem", "proteção do piso"],
    excludes: ["materiais e produtos", "obra estrutural"],
  },
});
invariant(proposal.laborSubtotalCents === lines.reduce((sum, line) => sum + line.laborPriceCents, 0), "Labor subtotal does not match proposal lines");
printSuccess("product-research:smoke", `${mode} · ${selections.length} products · proposal ${proposal.id}`);
