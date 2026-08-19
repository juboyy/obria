import { z } from "zod";
import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { analyzeAndCreateDesign } from "@/server/services/obria-service";
const CreateDesignInputSchema = z.object({ prompt: z.string().trim().min(1).max(1000).optional() });
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; const body = CreateDesignInputSchema.parse(await request.json().catch(() => ({}))); return NextResponse.json(await analyzeAndCreateDesign(actorFromRequest(request), id, body.prompt)); } catch (error) { return jsonError(error); } }
