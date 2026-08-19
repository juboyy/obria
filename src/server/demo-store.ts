import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { demoBrief, estimateQuantities, totalQuantities, type DesignPlan, type DesignVersion, type Opportunity, type Project, type Proposal, type RoomAnalysis } from "@/domain/obria";

export const DEMO_CLIENT_ID = "client-demo-001";
export const DEMO_SUPPLIER_ID = "supplier-demo-001";
export const DEMO_PROJECT_ID = "project-demo-001";
const dataDir = join(process.cwd(), "data");
const statePath = join(dataDir, "demo-state.json");

export type DemoState = { project: Project; versions: DesignVersion[]; opportunity: Opportunity | null; proposals: Proposal[]; audit: Array<{ action: string; actor: string; at: string }> };

function now() { return process.env.DEMO_CLOCK ?? "2026-08-19T12:00:00.000Z"; }
function imageDataUri(version: number) {
  const accent = version === 1 ? "#c9d4b2" : "#e7b68b";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="#f1eadf"/><path d="M0 820h1536v204H0z" fill="#8b5e45"/><path d="M110 120h1316v700H110z" fill="${accent}"/><path d="M200 240h600v500H200z" fill="#f8f4ee"/><path d="M940 350h340v390H940z" fill="#d5c4a8"/><circle cx="1160" cy="260" r="82" fill="#b5c8a4"/><text x="100" y="940" font-family="monospace" font-size="34" fill="#1b2421">OBRIA / V${version} / SÃO PAULO</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const analysis: RoomAnalysis = { observed: ["sala retangular", "vão de luz lateral", "piso existente preservável", "paredes sem sinais de infiltração"], uncertainties: ["posição exata das tomadas", "estado do contrapiso sob o piso atual"], fixedElements: [{ label: "vão principal", evidence: "abertura clara no lado direito da foto", confidence: 0.86 }, { label: "piso existente", evidence: "continuidade visual do piso", confidence: 0.72 }] };
const planV1: DesignPlan = { summary: "Abrir a sala para a luz, aquecer a leitura com madeira e preservar o que já funciona.", interventions: [{ catalogKey: "PAINT_WALLS", rationale: "base mineral clara amplia a luz", quantityHint: "paredes úteis", materials: ["cal mineral fosca"], preserve: ["piso existente"] }, { catalogKey: "LIGHT_POINT", rationale: "duas camadas de luz para noite", quantityHint: "2 pontos", materials: ["luz 2700K"], preserve: ["sem quebra estrutural"] }, { catalogKey: "SOFA", rationale: "assento baixo deixa o eixo livre", quantityHint: "1 peça", materials: ["linho cru", "madeira tauari"], preserve: ["circulação"] }, { catalogKey: "PLANTS", rationale: "verde para dar escala e vida", quantityHint: "3 vasos", materials: ["espécies de sombra"], preserve: ["janela"] }], imagePrompt: "sala de estar contemporânea acolhedora, mais luz, madeira quente, sem obra estrutural" };
const planV2: DesignPlan = { summary: "Menos marcenaria, mais plantas: a mesma sala ganha respiro e um jardim doméstico de baixa manutenção.", interventions: [{ catalogKey: "PAINT_WALLS", rationale: "mantém a luz difusa", quantityHint: "paredes úteis", materials: ["cal mineral"], preserve: ["piso existente"] }, { catalogKey: "PLANTS", rationale: "substitui volume fixo por vida", quantityHint: "5 vasos", materials: ["zamioculca", "jiboia", "costela-de-adão"], preserve: ["janela"] }, { catalogKey: "LIGHT_POINT", rationale: "ilumina os pontos verdes sem obra estrutural", quantityHint: "2 pontos", materials: ["luz 2700K"], preserve: ["instalação existente"] }, { catalogKey: "SOFA", rationale: "âncora móvel e reparável", quantityHint: "1 peça", materials: ["linho cru", "madeira certificada"], preserve: ["circulação"] }], imagePrompt: "sala de estar contemporânea acolhedora, menos marcenaria, mais plantas, luz quente e madeira" };

function makeVersion(number: number, plan: DesignPlan): DesignVersion {
  const quantities = estimateQuantities(demoBrief(), plan.interventions.map((item) => item.catalogKey));
  return { id: `version-demo-${number}`, projectId: DEMO_PROJECT_ID, number, state: number === 1 ? "READY" : "GENERATING", summary: plan.summary, plan, imageDataUri: imageDataUri(number), quantities, costCents: totalQuantities(quantities), co2Grams: number === 1 ? 118_400 : 92_700, createdAt: now() };
}

export function freshState(): DemoState {
  const project: Project = { id: DEMO_PROJECT_ID, ownerId: DEMO_CLIENT_ID, title: "Sala de estar · Pinheiros", state: "DESIGN_READY", revision: 3, brief: demoBrief(), analysis, originalAsset: "room-inputs/project-demo-001/original.webp", approvedVersionId: null, createdAt: now(), updatedAt: now() };
  return { project, versions: [makeVersion(1, planV1), makeVersion(2, planV2)], opportunity: null, proposals: [], audit: [{ action: "DEMO_RESET", actor: "system", at: now() }] };
}

export function loadState(): DemoState {
  if (!existsSync(statePath)) { const state = freshState(); saveState(state); return state; }
  return JSON.parse(readFileSync(statePath, "utf8")) as DemoState;
}
export function saveState(state: DemoState) { mkdirSync(dataDir, { recursive: true }); writeFileSync(statePath, JSON.stringify(state, null, 2)); }
export function resetState() { const state = freshState(); saveState(state); return state; }
export function record(state: DemoState, action: string, actor: string) { state.audit.push({ action, actor, at: now() }); state.project.updatedAt = now(); saveState(state); }
export function getDesignPlan(version: number): DesignPlan { return version === 2 ? planV2 : planV1; }
export function buildOpportunity(state: DemoState): Opportunity { const approved = state.versions.find((v) => v.id === state.project.approvedVersionId) ?? state.versions[1]; return { id: "opportunity-demo-001", projectId: state.project.id, city: state.project.brief.city, state: state.project.brief.state, title: "Sala de estar · Pinheiros", imageDataUri: approved.imageDataUri, quantities: approved.quantities, costCents: approved.costCents, co2Grams: approved.co2Grams, status: "OPEN", expiresAt: "2026-08-26T12:00:00.000Z" }; }
