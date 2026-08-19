import { CreateProposalInputSchema } from "@/domain/obria";
import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { createProposal } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; const input = CreateProposalInputSchema.parse(await request.json()); return NextResponse.json(await createProposal(actorFromRequest(request), id, input), { status: 201 }); } catch (error) { return jsonError(error); } }
