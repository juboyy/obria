import {
  CreateProposalInputSchema,
  DomainError,
  RoomBriefSchema,
  assertProjectTransition,
  estimateWorkQuantities,
  type CreateProposalInput,
  type Role,
} from "@/domain/obria";
import {
  ProductSelectionSchema,
  createProductResearchReport,
  type ProductResearchReport,
  type ProductSelectionRequest,
} from "@/domain/product-research";
import {
  buildOpportunity,
  DEMO_CLIENT_ID,
  DEMO_PROJECT_ID,
  DEMO_SUPPLIER_ID,
  loadState,
  mutateState,
  recordAudit,
  resetState,
  type DemoState,
} from "@/server/demo-store";
import { getMediaProvider } from "@/server/providers/media-provider";
import {
  LIVE_PRODUCT_SOURCE_NOTICE_PT_BR,
  REPLAY_PRODUCT_SOURCE_NOTICE_PT_BR,
  getProductOfferProvider,
} from "@/server/providers/product-offer-provider";

export type Actor = { id: string; role: Role; scope?: string[] };

function clock() {
  return process.env.DEMO_CLOCK ?? new Date().toISOString();
}

export function authorizeAction(actor: Actor, role: Role, action: string, projectId = DEMO_PROJECT_ID) {
  if (actor.role !== role) throw new DomainError("FORBIDDEN", `Ação ${action} exige papel ${role}`, 403);
  if (projectId !== DEMO_PROJECT_ID) throw new DomainError("NOT_FOUND", "Projeto não encontrado", 404);
}

function assertRevision(state: DemoState, expectedRevision: number) {
  if (state.project.revision !== expectedRevision) {
    throw new DomainError("REVISION_CONFLICT", "A sala mudou; atualize antes de continuar", 409);
  }
}

function requireApprovedVersion(state: DemoState) {
  const version = state.versions.find((item) => item.id === state.project.approvedVersionId && item.state === "APPROVED");
  if (!version) throw new DomainError("INVALID_STATE", "A versão aprovada não foi encontrada");
  return version;
}

export async function createProject(actor: Actor, briefInput: unknown) {
  authorizeAction(actor, "CLIENT", "createProject");
  const brief = RoomBriefSchema.parse(briefInput);
  return mutateState((state) => {
    state.project.brief = brief;
    state.project.state = "DRAFT";
    state.project.approvedVersionId = null;
    state.project.revision += 1;
    state.productResearch = null;
    state.productSelections = [];
    state.opportunity = null;
    state.proposals = [];
    recordAudit(state, "PROJECT_CREATED", actor.id);
    return state.project;
  });
}

export async function analyzeAndCreateDesign(actor: Actor, projectId = DEMO_PROJECT_ID, prompt?: string) {
  authorizeAction(actor, "CLIENT", "createDesign", projectId);
  return mutateState(async (state) => {
    if (["PLAN_APPROVED", "READY_TO_SHARE", "OPEN_FOR_QUOTES", "AWAITING_ACCEPTANCE", "ACCEPTED"].includes(state.project.state)) {
      throw new DomainError("PLAN_LOCKED", "A versão aprovada bloqueia novas iterações");
    }
    assertProjectTransition(state.project.state, "DESIGNING");
    const iteration = state.versions.length + 1;
    const provider = getMediaProvider();
    const job = await provider.createDesign({
      brief: state.project.brief,
      iteration,
      prompt,
      currentImageDataUri: state.versions.at(-1)?.imageDataUri,
    });
    const version = {
      id: `version-demo-${iteration}`,
      projectId,
      number: iteration,
      state: "READY" as const,
      summary: job.plan.summary,
      plan: job.plan,
      imageDataUri: job.imageDataUri,
      workQuantities: estimateWorkQuantities(state.project.brief, job.plan.interventions.map((item) => item.catalogKey)),
      createdAt: clock(),
    };
    state.versions = state.versions.map((item) => item.state === "READY" ? { ...item, state: "SUPERSEDED" as const } : item);
    state.versions.push(version);
    state.project.analysis = await provider.analyzeRoom(state.project.brief);
    state.project.state = "DESIGN_READY";
    state.project.revision += 1;
    state.productResearch = null;
    state.productSelections = [];
    recordAudit(state, "DESIGN_REQUESTED", actor.id);
    recordAudit(state, "DESIGN_READY", actor.id);
    return version;
  });
}

export async function approveDesign(actor: Actor, projectId: string, versionId: string, expectedRevision: number) {
  authorizeAction(actor, "CLIENT", "approveDesign", projectId);
  return mutateState((state) => {
    assertRevision(state, expectedRevision);
    if (state.project.state !== "DESIGN_READY") throw new DomainError("INVALID_STATE", "Apenas uma versão pronta pode ser aprovada");
    const version = state.versions.find((item) => item.id === versionId && item.state === "READY");
    if (!version) throw new DomainError("NOT_FOUND", "Versão pronta não encontrada", 404);
    assertProjectTransition(state.project.state, "PLAN_APPROVED");
    version.state = "APPROVED";
    state.project.approvedVersionId = versionId;
    state.project.state = "PLAN_APPROVED";
    state.project.revision += 1;
    state.productResearch = null;
    state.productSelections = [];
    state.opportunity = null;
    state.proposals = [];
    recordAudit(state, "DESIGN_APPROVED", actor.id);
    return { project: state.project, version };
  });
}

export async function researchProducts(actor: Actor, projectId: string, expectedRevision: number): Promise<ProductResearchReport> {
  authorizeAction(actor, "CLIENT", "researchProducts", projectId);
  return mutateState(async (state) => {
    assertRevision(state, expectedRevision);
    if (state.project.state !== "PLAN_APPROVED") {
      throw new DomainError("INVALID_STATE", "A pesquisa exige um plano aprovado");
    }
    const version = requireApprovedVersion(state);
    const provider = getProductOfferProvider();
    const entries = await Promise.all(version.plan.productNeeds.map(async (need) => [need.id, await provider.search(need)] as const));
    const offersByNeed = Object.fromEntries(entries);
    const providerMode = provider.mode;
    const report = createProductResearchReport({
      projectId,
      versionId: version.id,
      providerMode,
      collectedAt: clock(),
      sourceNoticePtBr: providerMode === "LIVE" ? LIVE_PRODUCT_SOURCE_NOTICE_PT_BR : REPLAY_PRODUCT_SOURCE_NOTICE_PT_BR,
      productNeeds: version.plan.productNeeds,
      offersByNeed,
    });
    state.productResearch = report;
    state.productSelections = [];
    state.project.revision += 1;
    recordAudit(state, "PRODUCT_RESEARCHED", actor.id);
    return report;
  });
}

export async function selectProductPaths(actor: Actor, projectId: string, input: ProductSelectionRequest) {
  authorizeAction(actor, "CLIENT", "selectProductPaths", projectId);
  return mutateState((state) => {
    assertRevision(state, input.expectedRevision);
    if (state.project.state !== "PLAN_APPROVED") {
      throw new DomainError("INVALID_STATE", "A seleção exige um plano aprovado");
    }
    const version = requireApprovedVersion(state);
    const report = state.productResearch;
    if (!report || report.projectId !== projectId || report.versionId !== version.id) {
      throw new DomainError("PRODUCT_RESEARCH_REQUIRED", "Pesquise os produtos da versão aprovada antes de escolher");
    }
    if (input.selections.length !== version.plan.productNeeds.length) {
      throw new DomainError("INCOMPLETE_PRODUCT_SELECTION", "Escolha exatamente um caminho para cada produto", 409);
    }
    const requestedByNeed = new Map(input.selections.map((choice) => [choice.needId, choice]));
    if (requestedByNeed.size !== version.plan.productNeeds.length || version.plan.productNeeds.some((need) => !requestedByNeed.has(need.id))) {
      throw new DomainError("INCOMPLETE_PRODUCT_SELECTION", "Escolha exatamente um caminho para cada produto", 409);
    }

    let materialsEstimateCents = 0;
    const selectedAt = clock();
    const selections = version.plan.productNeeds.map((need) => {
      const choice = requestedByNeed.get(need.id)!;
      const result = report.results.find((item) => item.need.id === need.id);
      const path = result?.paths.find((item) => item.kind === choice.path);
      if (!result || !path || !path.offerId || (path.status !== "AVAILABLE" && path.status !== "AVAILABLE_WITH_VERIFICATION")) {
        throw new DomainError("PRODUCT_PATH_UNAVAILABLE", `O caminho ${choice.path} não está disponível para ${need.label}`, 409);
      }
      const offer = result.offers.find((item) => item.offerId === path.offerId);
      if (!offer) throw new DomainError("PRODUCT_PATH_UNAVAILABLE", "A oferta escolhida não está mais no relatório", 409);
      materialsEstimateCents += offer.unitPriceCents.high * need.quantity;
      return ProductSelectionSchema.parse({ needId: need.id, path: choice.path, offerId: offer.offerId, selectedAt });
    });

    assertProjectTransition(state.project.state, "READY_TO_SHARE");
    state.productSelections = selections;
    state.project.state = "READY_TO_SHARE";
    state.project.revision += 1;
    recordAudit(state, "PRODUCTS_SELECTED", actor.id);
    return { selections, materialsEstimateCents, project: state.project };
  });
}

export async function publishOpportunity(actor: Actor, projectId = DEMO_PROJECT_ID) {
  authorizeAction(actor, "CLIENT", "publishOpportunity", projectId);
  return mutateState((state) => {
    if (state.project.state !== "READY_TO_SHARE") {
      throw new DomainError("INVALID_STATE", "Escolha todos os produtos antes de publicar");
    }
    assertProjectTransition(state.project.state, "OPEN_FOR_QUOTES");
    const opportunity = buildOpportunity(state);
    state.opportunity = opportunity;
    state.project.state = "OPEN_FOR_QUOTES";
    state.project.revision += 1;
    recordAudit(state, "OPPORTUNITY_PUBLISHED", actor.id);
    return opportunity;
  });
}

export async function listOpportunities(actor: Actor) {
  authorizeAction(actor, "SUPPLIER", "listOpportunities");
  const state = await loadState();
  return state.opportunity ? [state.opportunity] : [];
}

export async function createProposal(actor: Actor, opportunityId: string, proposalInput: CreateProposalInput) {
  authorizeAction(actor, "SUPPLIER", "createProposal");
  const input = CreateProposalInputSchema.parse(proposalInput);
  return mutateState((state) => {
    if (!state.opportunity || state.opportunity.id !== opportunityId) {
      throw new DomainError("NOT_FOUND", "Oportunidade não encontrada", 404);
    }
    if (state.project.state !== "OPEN_FOR_QUOTES" || state.opportunity.status !== "OPEN") {
      throw new DomainError("INVALID_STATE", "A oportunidade não está aberta para proposta");
    }
    const allowedWork = new Set(state.opportunity.workQuantities.map((quantity) => quantity.catalogKey));
    if (input.lines.some((line) => !allowedWork.has(line.catalogKey))) {
      throw new DomainError("INVALID_PROPOSAL_LINE", "A proposta deve conter somente mão de obra prevista", 400);
    }
    const laborSubtotalCents = input.lines.reduce((sum, line) => sum + line.laborPriceCents, 0);
    const proposal = {
      id: "proposal-demo-001",
      opportunityId,
      supplierId: actor.id,
      state: "SUBMITTED" as const,
      ...input,
      laborSubtotalCents,
      totalCents: laborSubtotalCents + input.freightCents + input.taxCents,
    };
    assertProjectTransition(state.project.state, "AWAITING_ACCEPTANCE");
    state.proposals = [proposal];
    state.opportunity.status = "AWAITING_ACCEPTANCE";
    state.project.state = "AWAITING_ACCEPTANCE";
    state.project.revision += 1;
    recordAudit(state, "PROPOSAL_SUBMITTED", actor.id);
    return proposal;
  });
}

export async function acceptProposal(actor: Actor, proposalId: string) {
  authorizeAction(actor, "CLIENT", "acceptProposal");
  return mutateState((state) => {
    const proposal = state.proposals.find((item) => item.id === proposalId);
    if (!proposal) throw new DomainError("NOT_FOUND", "Proposta não encontrada", 404);
    if (proposal.state === "ACCEPTED") return proposal;
    if (state.project.state !== "AWAITING_ACCEPTANCE") {
      throw new DomainError("INVALID_STATE", "Não há proposta aguardando aceite");
    }
    assertProjectTransition(state.project.state, "ACCEPTED");
    proposal.state = "ACCEPTED";
    if (state.opportunity) state.opportunity.status = "ACCEPTED";
    state.project.state = "ACCEPTED";
    state.project.revision += 1;
    recordAudit(state, "PROPOSAL_ACCEPTED", actor.id);
    return proposal;
  });
}

export function demoActor(role: Role): Actor {
  return role === "CLIENT"
    ? { id: DEMO_CLIENT_ID, role, scope: ["client:read", "client:write"] }
    : { id: DEMO_SUPPLIER_ID, role, scope: ["supplier:read", "supplier:write"] };
}

export async function getDemoView(actor: Actor): Promise<DemoState> {
  const state = await loadState();
  if (actor.role !== "SUPPLIER") return state;
  return {
    ...state,
    project: {
      ...state.project,
      originalAsset: "redacted",
      analysis: { observed: [], uncertainties: [], fixedElements: [] },
    },
    versions: state.versions.filter((version) => version.state === "APPROVED"),
    productResearch: null,
    productSelections: [],
  };
}

export async function resetDemo(actor: Actor) {
  authorizeAction(actor, "CLIENT", "resetDemo");
  return resetState();
}
