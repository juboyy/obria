import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { getDemoView } from "@/server/services/obria-service";
export async function GET(request: Request) { try { return NextResponse.json(getDemoView(actorFromRequest(request))); } catch (error) { return jsonError(error); } }
