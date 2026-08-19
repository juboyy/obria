import { NextResponse } from "next/server";
import { DomainError, type Role } from "@/domain/obria";
import { demoActor, type Actor } from "@/server/services/obria-service";

export function actorFromRequest(request: Request): Actor {
  const role = request.headers.get("x-obria-role") ?? (request.headers.get("authorization")?.toLowerCase().includes("supplier") ? "SUPPLIER" : "CLIENT");
  return demoActor(role === "SUPPLIER" ? "SUPPLIER" : "CLIENT");
}
export function jsonError(error: unknown) { if (error instanceof DomainError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status }); if (error instanceof Error) return NextResponse.json({ error: { code: "BAD_REQUEST", message: error.message } }, { status: 400 }); return NextResponse.json({ error: { code: "INTERNAL", message: "Erro interno" } }, { status: 500 }); }
export function requireRole(actor: Actor, role: Role) { if (actor.role !== role) throw new DomainError("FORBIDDEN", "Papel sem acesso a esta ação", 403); }
