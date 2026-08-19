import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { listOpportunities } from "@/server/services/obria-service";
export async function GET(request: Request) { try { return NextResponse.json(listOpportunities(actorFromRequest(request))); } catch (error) { return jsonError(error); } }
