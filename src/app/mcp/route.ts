import { NextResponse } from "next/server";
import { z } from "zod";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { DomainError } from "@/domain/obria";
import { DecisionPathKindSchema, ProductSelectionRequestSchema } from "@/domain/product-research";
import {
  analyzeAndCreateDesign,
  getDemoView,
  listOpportunities,
  researchProducts,
  selectProductPaths,
} from "@/server/services/obria-service";

const ProductResearchToolInputSchema = z.object({
  projectId: z.string().min(1),
  expectedRevision: z.number().int().nonnegative(),
}).strict();

const ProductSelectionToolInputSchema = z.object({
  projectId: z.string().min(1),
  expectedRevision: z.number().int().nonnegative(),
  selections: z.array(z.object({
    needId: z.string().min(1).max(80),
    path: DecisionPathKindSchema,
  }).strict()).min(1).max(8),
}).strict();

function checkOrigin(request: Request) {
  const allowed = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && origin !== allowed) throw new DomainError("ORIGIN_REJECTED", "Origin não autorizado", 403);
  if (!host) throw new DomainError("HOST_REQUIRED", "Host ausente", 400);
}

function toolsFor(role: "CLIENT" | "SUPPLIER") {
  if (role === "SUPPLIER") {
    return [
      { name: "opportunities.list", description: "Lista demandas publicadas sem identidade pessoal", inputSchema: { type: "object", properties: {} } },
      { name: "proposal.draft", description: "Prepara uma proposta para revisão do fornecedor", inputSchema: { type: "object", properties: { opportunityId: { type: "string" } }, required: ["opportunityId"] } },
    ];
  }
  return [
    { name: "room.read", description: "Lê a sala do cliente autorizada", inputSchema: { type: "object", properties: {} } },
    { name: "design.iterate", description: "Cria uma iteração visual; aprovação permanece na UI", inputSchema: { type: "object", properties: { prompt: { type: "string" } } } },
    {
      name: "products.research",
      description: "Pesquisa ofertas para as necessidades da versão aprovada",
      inputSchema: {
        type: "object",
        properties: { projectId: { type: "string" }, expectedRevision: { type: "integer", minimum: 0 } },
        required: ["projectId", "expectedRevision"],
        additionalProperties: false,
      },
    },
    {
      name: "products.select",
      description: "Escolhe atomicamente um caminho disponível para cada necessidade",
      inputSchema: {
        type: "object",
        properties: {
          projectId: { type: "string" },
          expectedRevision: { type: "integer", minimum: 0 },
          selections: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: {
              type: "object",
              properties: {
                needId: { type: "string" },
                path: { type: "string", enum: DecisionPathKindSchema.options },
              },
              required: ["needId", "path"],
              additionalProperties: false,
            },
          },
        },
        required: ["projectId", "expectedRevision", "selections"],
        additionalProperties: false,
      },
    },
  ];
}

function toolResult(id: unknown, value: unknown) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: JSON.stringify(value) }] },
  });
}

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const auth = request.headers.get("authorization") ?? "";
    if (!auth.toLowerCase().startsWith("bearer ")) throw new DomainError("UNAUTHORIZED", "Bearer obrigatório", 401);
    const actor = actorFromRequest(request);
    const body = await request.json();
    const id = body.id ?? null;

    if (body.method === "server/discover" || body.method === "initialize") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2026-07-28",
          serverInfo: { name: "obria", version: "0.1.0" },
          capabilities: { tools: {}, resources: {} },
        },
      });
    }
    if (body.method === "tools/list") {
      return NextResponse.json({ jsonrpc: "2.0", id, result: { tools: toolsFor(actor.role) } });
    }
    if (body.method === "resources/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { resources: [{ uri: "obria://room/demo", name: "Sala demo", mimeType: "application/json" }] },
      });
    }
    if (body.method === "resources/read") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          contents: [{ uri: "obria://room/demo", mimeType: "application/json", text: JSON.stringify(await getDemoView(actor)) }],
        },
      });
    }
    if (body.method !== "tools/call") {
      throw new DomainError("METHOD_NOT_FOUND", "Método MCP não suportado", 404);
    }

    const name = body.params?.name;
    const args = body.params?.arguments ?? {};
    if (name === "room.read" && actor.role === "CLIENT") return toolResult(id, await getDemoView(actor));
    if (name === "design.iterate" && actor.role === "CLIENT") {
      const prompt = z.object({ prompt: z.string().trim().min(1).max(1000).optional() }).strict().parse(args).prompt;
      return toolResult(id, await analyzeAndCreateDesign(actor, undefined, prompt));
    }
    if (name === "products.research" && actor.role === "CLIENT") {
      const input = ProductResearchToolInputSchema.parse(args);
      return toolResult(id, await researchProducts(actor, input.projectId, input.expectedRevision));
    }
    if (name === "products.select" && actor.role === "CLIENT") {
      const input = ProductSelectionToolInputSchema.parse(args);
      const selectionRequest = ProductSelectionRequestSchema.parse({
        expectedRevision: input.expectedRevision,
        selections: input.selections,
      });
      return toolResult(id, await selectProductPaths(actor, input.projectId, selectionRequest));
    }
    if (name === "opportunities.list" && actor.role === "SUPPLIER") {
      return toolResult(id, await listOpportunities(actor));
    }
    throw new DomainError("FORBIDDEN", "Tool não disponível para este papel", 403);
  } catch (error) {
    return jsonError(error);
  }
}
