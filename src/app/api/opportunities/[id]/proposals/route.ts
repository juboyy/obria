import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { createProposal } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; return NextResponse.json(createProposal(actorFromRequest(request), id, await request.json()), { status: 201 }); } catch (error) { return jsonError(error); } }
