import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { analyzeAndCreateDesign } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; const body = await request.json().catch(() => ({})); return NextResponse.json(await analyzeAndCreateDesign(actorFromRequest(request), id, body.prompt)); } catch (error) { return jsonError(error); } }
