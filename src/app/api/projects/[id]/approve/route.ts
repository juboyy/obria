import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { approveDesign } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; const body = await request.json(); return NextResponse.json(approveDesign(actorFromRequest(request), id, body.versionId, body.expectedRevision)); } catch (error) { return jsonError(error); } }
