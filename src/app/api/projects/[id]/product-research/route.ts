import { NextResponse } from "next/server";
import { z } from "zod";
import { actorFromRequest, jsonError } from "@/app/api/_lib";
import { ProductSelectionRequestSchema } from "@/domain/product-research";
import { researchProducts, selectProductPaths } from "@/server/services/obria-service";

const ProductResearchRequestSchema = z.object({ expectedRevision: z.number().int().nonnegative() });

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = ProductResearchRequestSchema.parse(await request.json());
    return NextResponse.json(await researchProducts(actorFromRequest(request), id, input.expectedRevision));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = ProductSelectionRequestSchema.parse(await request.json());
    return NextResponse.json(await selectProductPaths(actorFromRequest(request), id, input));
  } catch (error) {
    return jsonError(error);
  }
}
