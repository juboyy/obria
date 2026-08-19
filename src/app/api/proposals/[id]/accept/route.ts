import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { acceptProposal } from "@/server/services/obria-service";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { try { const { id } = await context.params; return NextResponse.json(await acceptProposal(actorFromRequest(request), id)); } catch (error) { return jsonError(error); } }
