import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { loadState } from "@/server/demo-store";
import { DomainError } from "@/domain/obria";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const actor = actorFromRequest(request); if (actor.role !== "CLIENT") throw new DomainError("FORBIDDEN", "Apenas o cliente pode gerar o mundo", 403); const { id } = await context.params; const state = await loadState(); if (state.project.id !== id || state.project.state !== "PLAN_APPROVED") throw new DomainError("INVALID_STATE", "Aprove o plano antes do 3D"); return NextResponse.json({ operationId: "world-operation-demo-001", worldId: "world-demo-001", status: "done", assets: { splats: { spzUrl: "/api/worlds/world-demo-001.spz" } } }); } catch (error) { return jsonError(error); } }
