import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { publishOpportunity } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; return NextResponse.json(publishOpportunity(actorFromRequest(request), id)); } catch (error) { return jsonError(error); } }
