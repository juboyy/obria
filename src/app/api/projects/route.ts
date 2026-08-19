import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { createProject } from "@/server/services/obria-service";
export async function POST(request: Request) { try { return NextResponse.json(await createProject(actorFromRequest(request), await request.json()), { status: 201 }); } catch (error) { return jsonError(error); } }
