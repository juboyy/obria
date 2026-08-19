import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { getDemoView, resetDemo } from "@/server/services/obria-service";
export async function GET(request: Request) { try { return NextResponse.json(await getDemoView(actorFromRequest(request))); } catch (error) { return jsonError(error); } }
export async function POST(request: Request) { try { return NextResponse.json(await resetDemo(actorFromRequest(request))); } catch (error) { return jsonError(error); } }
