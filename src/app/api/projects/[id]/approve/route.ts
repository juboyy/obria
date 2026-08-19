import { z } from "zod";
import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { approveDesign } from "@/server/services/obria-service";
const ApproveDesignInputSchema = z.object({ versionId: z.string().min(1), expectedRevision: z.number().int().nonnegative() });
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; const body = ApproveDesignInputSchema.parse(await request.json()); return NextResponse.json(await approveDesign(actorFromRequest(request), id, body.versionId, body.expectedRevision)); } catch (error) { return jsonError(error); } }
