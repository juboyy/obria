import { NextResponse } from "next/server";
export async function GET() { const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"; return NextResponse.json({ resource: `${site}/mcp`, authorization_servers: [`${site}/auth`], scopes_supported: ["client:read", "client:write", "supplier:read", "supplier:write"] }); }
