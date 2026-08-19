import { NextResponse } from "next/server";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { CreateDesignInputSchema } from "@/domain/obria";
import { analyzeAndCreateDesign } from "@/server/services/obria-service";

export const maxDuration = 300;

const directions = [
  "mais luz natural, materiais claros e madeira suave",
  "texturas artesanais e contraste de materiais sem excessos",
  "mais plantas, luz quente e elementos existentes preservados",
  "contraste essencial com um único gesto de cor terrosa",
] as const;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const actor = actorFromRequest(request);
    const input = CreateDesignInputSchema.parse(await request.json().catch(() => ({})));
    const versions = [];
    for (const direction of directions) {
      versions.push(await analyzeAndCreateDesign(actor, id, {
        ...input,
        prompt: `${input.prompt ?? "Renovar este ambiente."} Direção visual: ${direction}.`,
      }));
    }
    return NextResponse.json({ versions });
  } catch (error) {
    return jsonError(error);
  }
}
