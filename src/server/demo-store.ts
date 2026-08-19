import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  DesignVersionSchema,
  DomainError,
  OpportunitySchema,
  ProjectSchema,
  ProposalSchema,
  SelectedProductSchema,
  demoBrief,
  estimateWorkQuantities,
  type DesignPlan,
  type DesignVersion,
  type Opportunity,
  type ProductNeed,
  type Project,
  type Proposal,
  type RoomAnalysis,
} from "@/domain/obria";
import {
  ProductResearchReportSchema,
  ProductSelectionSchema,
  type ProductResearchReport,
  type ProductSelection,
} from "@/domain/product-research";

export const DEMO_CLIENT_ID = "client-demo-001";
export const DEMO_SUPPLIER_ID = "supplier-demo-001";
export const DEMO_PROJECT_ID = "project-demo-001";

const STATE_ID = "demo-state";
const dataDir = join(process.cwd(), "data");
const statePath = join(dataDir, "demo-state.json");
const temporaryStatePath = join(dataDir, "demo-state.json.tmp");

const AuditEntrySchema = z.object({ action: z.string(), actor: z.string(), at: z.string() });
const DemoStateSchema = z.object({
  project: ProjectSchema,
  versions: z.array(DesignVersionSchema),
  opportunity: OpportunitySchema.nullable(),
  proposals: z.array(ProposalSchema),
  productResearch: ProductResearchReportSchema.nullable(),
  productSelections: z.array(ProductSelectionSchema),
  audit: z.array(AuditEntrySchema),
});

export type DemoState = z.infer<typeof DemoStateSchema>;

function now() {
  return process.env.DEMO_CLOCK ?? new Date().toISOString();
}

function imageDataUri(version: number) {
  const accent = version === 1 ? "#c9d4b2" : "#e7b68b";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="#f1eadf"/><path d="M0 820h1536v204H0z" fill="#8b5e45"/><path d="M110 120h1316v700H110z" fill="${accent}"/><path d="M200 240h600v500H200z" fill="#f8f4ee"/><path d="M940 350h340v390H940z" fill="#d5c4a8"/><circle cx="1160" cy="260" r="82" fill="#b5c8a4"/><text x="100" y="940" font-family="monospace" font-size="34" fill="#1b2421">OBRIA / V${version} / SÃO PAULO</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const analysis: RoomAnalysis = {
  observed: ["sala retangular", "vão de luz lateral", "piso existente preservável", "paredes sem sinais de infiltração"],
  uncertainties: ["posição exata das tomadas", "estado do contrapiso sob o piso atual"],
  fixedElements: [
    { label: "vão principal", evidence: "abertura clara no lado direito da foto", confidence: 0.86 },
    { label: "piso existente", evidence: "continuidade visual do piso", confidence: 0.72 },
  ],
};

const productNeeds: ProductNeed[] = [
  {
    id: "need-light-demo",
    catalogKey: "LIGHT_POINT",
    label: "Luminária LED quente",
    searchQuery: "luminária LED 2700K",
    requiredTermGroups: [["luminária", "abajur"], ["LED"]],
    quantity: 2,
    constraints: ["luz quente 2700K", "confirmar tensão, soquete e compatibilidade elétrica"],
  },
  {
    id: "need-rug-demo",
    catalogKey: "RUG",
    label: "Tapete de sala",
    searchQuery: "tapete sala 200x150 lavável",
    requiredTermGroups: [["tapete"], ["sala"]],
    quantity: 1,
    constraints: ["dimensão aproximada 200x150 cm", "confirmar manutenção e limpeza"],
  },
  {
    id: "need-side-table-demo",
    catalogKey: "SIDE_TABLE",
    label: "Mesa lateral",
    searchQuery: "mesa lateral madeira sala",
    requiredTermGroups: [["mesa"], ["lateral", "apoio"]],
    quantity: 1,
    constraints: ["preservar a circulação", "preferir construção reparável"],
  },
];

const planV1: DesignPlan = {
  summary: "Abrir a sala para a luz, aquecer a leitura com madeira e preservar o que já funciona.",
  interventions: [
    { catalogKey: "PAINT_WALLS", rationale: "base mineral clara amplia a luz", quantityHint: "paredes úteis", materials: ["cal mineral fosca"], preserve: ["piso existente"] },
    { catalogKey: "LIGHT_POINT", rationale: "duas camadas de luz para noite", quantityHint: "2 pontos", materials: ["luz 2700K"], preserve: ["sem quebra estrutural"] },
    { catalogKey: "SOFA", rationale: "assento baixo deixa o eixo livre", quantityHint: "1 peça", materials: ["linho cru", "madeira tauari"], preserve: ["circulação"] },
    { catalogKey: "PLANTS", rationale: "verde para dar escala e vida", quantityHint: "3 vasos", materials: ["espécies de sombra"], preserve: ["janela"] },
  ],
  productNeeds,
  imagePrompt: "sala de estar contemporânea acolhedora, mais luz, madeira quente, sem obra estrutural",
};

const planV2: DesignPlan = {
  summary: "Menos marcenaria, mais plantas: a mesma sala ganha respiro e um jardim doméstico de baixa manutenção.",
  interventions: [
    { catalogKey: "PAINT_WALLS", rationale: "mantém a luz difusa", quantityHint: "paredes úteis", materials: ["cal mineral"], preserve: ["piso existente"] },
    { catalogKey: "PLANTS", rationale: "substitui volume fixo por vida", quantityHint: "5 vasos", materials: ["zamioculca", "jiboia", "costela-de-adão"], preserve: ["janela"] },
    { catalogKey: "LIGHT_POINT", rationale: "ilumina os pontos verdes sem obra estrutural", quantityHint: "2 pontos", materials: ["luz 2700K"], preserve: ["instalação existente"] },
    { catalogKey: "SOFA", rationale: "âncora móvel e reparável", quantityHint: "1 peça", materials: ["linho cru", "madeira certificada"], preserve: ["circulação"] },
  ],
  productNeeds,
  imagePrompt: "sala de estar contemporânea acolhedora, menos marcenaria, mais plantas, luz quente e madeira",
};

export function getDesignPlan(version: number): DesignPlan {
  return version === 2 ? planV2 : planV1;
}

function makeVersion(number: number, plan: DesignPlan): DesignVersion {
  return {
    id: `version-demo-${number}`,
    projectId: DEMO_PROJECT_ID,
    number,
    state: number === 1 ? "READY" : "GENERATING",
    summary: plan.summary,
    plan,
    imageDataUri: imageDataUri(number),
    workQuantities: estimateWorkQuantities(demoBrief(), plan.interventions.map((item) => item.catalogKey)),
    createdAt: now(),
  };
}

export function freshState(): DemoState {
  const project: Project = {
    id: DEMO_PROJECT_ID,
    ownerId: DEMO_CLIENT_ID,
    title: "Sala de estar · Pinheiros",
    state: "DESIGN_READY",
    revision: 3,
    brief: demoBrief(),
    analysis,
    originalAsset: "room-inputs/project-demo-001/original.webp",
    approvedVersionId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  return {
    project,
    versions: [makeVersion(1, planV1), makeVersion(2, planV2)],
    opportunity: null,
    proposals: [],
    productResearch: null,
    productSelections: [],
    audit: [{ action: "DEMO_RESET", actor: "system", at: now() }],
  };
}

function hydrateState(input: unknown): DemoState {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new DomainError("STATE_STORE_ERROR", "Estado persistido inválido", 502);
  }
  const value = input as Record<string, unknown>;
  const parsed = DemoStateSchema.safeParse({
    ...value,
    productResearch: value.productResearch ?? null,
    productSelections: value.productSelections ?? [],
  });
  if (!parsed.success) {
    throw new DomainError("STATE_STORE_ERROR", "Estado persistido inválido", 502);
  }
  return parsed.data;
}

type StoredState = { state: DemoState; updatedAt: string | null };
const SupabaseRowSchema = z.object({ state: z.unknown(), updated_at: z.string().datetime({ offset: true }) });

function useSupabase() {
  return process.env.OBRIA_STATE_STORE === "supabase";
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new DomainError("STATE_STORE_UNAVAILABLE", "Persistência Supabase não configurada", 503);
  }
  return { url, key };
}

function supabaseHeaders(key: string, prefer?: string) {
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {}),
  };
}

async function readSupabaseState(): Promise<StoredState | null> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/obria_demo_state?id=eq.${STATE_ID}&select=state,updated_at&limit=1`, {
    headers: supabaseHeaders(key),
    cache: "no-store",
  });
  if (!response.ok) throw new DomainError("STATE_STORE_ERROR", "Falha ao ler o estado persistido", 502);
  const rows = z.array(SupabaseRowSchema).safeParse(await response.json());
  if (!rows.success) throw new DomainError("STATE_STORE_ERROR", "Resposta inválida da persistência", 502);
  const row = rows.data[0];
  return row ? { state: hydrateState(row.state), updatedAt: row.updated_at } : null;
}

async function insertSupabaseState(state: DemoState) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/obria_demo_state?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders(key, "resolution=ignore-duplicates,return=minimal"),
    body: JSON.stringify({ id: STATE_ID, state, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new DomainError("STATE_STORE_ERROR", "Falha ao inicializar o estado persistido", 502);
}

async function replaceSupabaseState(state: DemoState) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/obria_demo_state?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders(key, "resolution=merge-duplicates,return=minimal"),
    body: JSON.stringify({ id: STATE_ID, state, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new DomainError("STATE_STORE_ERROR", "Falha ao reiniciar o estado persistido", 502);
}

async function updateSupabaseState(state: DemoState, previousUpdatedAt: string | null) {
  if (!previousUpdatedAt) throw new DomainError("REVISION_CONFLICT", "O estado mudou; atualize antes de continuar", 409);
  const { url, key } = supabaseConfig();
  const nextUpdatedAt = new Date(Math.max(Date.now(), Date.parse(previousUpdatedAt) + 1)).toISOString();
  const response = await fetch(
    `${url}/rest/v1/obria_demo_state?id=eq.${STATE_ID}&updated_at=eq.${encodeURIComponent(previousUpdatedAt)}&select=id`,
    {
      method: "PATCH",
      headers: supabaseHeaders(key, "return=representation"),
      body: JSON.stringify({ state, updated_at: nextUpdatedAt }),
    },
  );
  if (!response.ok) throw new DomainError("STATE_STORE_ERROR", "Falha ao persistir o estado", 502);
  const rows = z.array(z.object({ id: z.string() })).safeParse(await response.json());
  if (!rows.success) throw new DomainError("STATE_STORE_ERROR", "Resposta inválida da persistência", 502);
  if (rows.data.length !== 1) throw new DomainError("REVISION_CONFLICT", "O estado mudou; atualize antes de continuar", 409);
}

async function readLocalState(): Promise<StoredState | null> {
  try {
    const text = await readFile(statePath, "utf8");
    return { state: hydrateState(JSON.parse(text) as unknown), updatedAt: null };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    if (error instanceof DomainError) throw error;
    throw new DomainError("STATE_STORE_ERROR", "Falha ao ler o estado local", 500);
  }
}

async function writeLocalState(state: DemoState) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(temporaryStatePath, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryStatePath, statePath);
}

async function readStoredState(): Promise<StoredState> {
  if (useSupabase()) {
    const existing = await readSupabaseState();
    if (existing) return existing;
    await insertSupabaseState(freshState());
    const initialized = await readSupabaseState();
    if (!initialized) throw new DomainError("STATE_STORE_ERROR", "Estado persistido não foi inicializado", 502);
    return initialized;
  }
  const existing = await readLocalState();
  if (existing) return existing;
  const state = freshState();
  await writeLocalState(state);
  return { state, updatedAt: null };
}

let mutationQueue: Promise<void> = Promise.resolve();

async function withMutationLock<T>(work: () => Promise<T>): Promise<T> {
  const previous = mutationQueue;
  let release = () => {};
  mutationQueue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
}

export async function loadState(): Promise<DemoState> {
  return (await readStoredState()).state;
}

export async function mutateState<T>(mutation: (state: DemoState) => Promise<T> | T): Promise<T> {
  return withMutationLock(async () => {
    const stored = await readStoredState();
    const result = await mutation(stored.state);
    const validatedState = DemoStateSchema.parse(stored.state);
    if (useSupabase()) await updateSupabaseState(validatedState, stored.updatedAt);
    else await writeLocalState(validatedState);
    return result;
  });
}

export async function resetState(): Promise<DemoState> {
  return withMutationLock(async () => {
    const state = freshState();
    if (useSupabase()) await replaceSupabaseState(state);
    else await writeLocalState(state);
    return state;
  });
}

export function recordAudit(state: DemoState, action: string, actor: string) {
  state.audit.push({ action, actor, at: now() });
  state.project.updatedAt = now();
}

export function buildOpportunity(state: DemoState): Opportunity {
  const approved = state.versions.find((version) => version.id === state.project.approvedVersionId && version.state === "APPROVED");
  const report = state.productResearch;
  if (!approved || !report || report.projectId !== state.project.id || report.versionId !== approved.id) {
    throw new DomainError("PRODUCT_RESEARCH_REQUIRED", "Pesquise e escolha os produtos da versão aprovada antes de publicar");
  }
  if (state.productSelections.length !== approved.plan.productNeeds.length) {
    throw new DomainError("PRODUCT_RESEARCH_REQUIRED", "A seleção de produtos está incompleta");
  }

  const selectedProducts = state.productSelections.map((selection) => {
    const result = report.results.find((item) => item.need.id === selection.needId);
    const path = result?.paths.find((item) => item.kind === selection.path);
    const offer = result?.offers.find((item) => item.offerId === selection.offerId);
    if (!result || !path || !offer || path.offerId !== offer.offerId || (path.status !== "AVAILABLE" && path.status !== "AVAILABLE_WITH_VERIFICATION")) {
      throw new DomainError("PRODUCT_RESEARCH_REQUIRED", "A seleção de produtos não corresponde à pesquisa aprovada");
    }
    const quantity = result.need.quantity;
    return SelectedProductSchema.parse({
      needId: result.need.id,
      catalogKey: result.need.catalogKey,
      label: result.need.label,
      quantity,
      path: selection.path,
      provider: offer.provider,
      offerId: offer.offerId,
      productName: offer.productName,
      shopName: offer.shopName,
      productUrl: offer.productUrl,
      offerUrl: offer.offerUrl,
      unitPriceCents: offer.unitPriceCents,
      totalPriceCents: {
        low: offer.unitPriceCents.low * quantity,
        high: offer.unitPriceCents.high * quantity,
      },
      whatToVerifyPtBr: path.whatToVerifyPtBr,
    });
  });

  const materialsEstimateCents = selectedProducts.reduce((sum, product) => sum + product.totalPriceCents.high, 0);
  return OpportunitySchema.parse({
    id: "opportunity-demo-001",
    projectId: state.project.id,
    city: state.project.brief.city,
    state: state.project.brief.state,
    title: state.project.title,
    imageDataUri: approved.imageDataUri,
    workQuantities: approved.workQuantities,
    selectedProducts,
    materialsEstimateCents,
    priceResearch: {
      provider: report.providerMode === "LIVE" ? "SHOPEE_AFFILIATE" : "REPLAY",
      collectedAt: report.collectedAt,
      noticePtBr: report.sourceNoticePtBr,
    },
    laborPricing: "SUPPLIER_QUOTE_REQUIRED",
    status: "OPEN",
    expiresAt: "2026-08-26T12:00:00.000Z",
  });
}
