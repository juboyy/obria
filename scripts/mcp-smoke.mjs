import { invariant, printSuccess, request } from "./_http.mjs";

let id = 0;
const call = (role, method, params, expectedStatus) => request("/mcp", {
  method: "POST",
  role,
  headers: { authorization: "Bearer demo-smoke" },
  body: { jsonrpc: "2.0", id: ++id, method, ...(params ? { params } : {}) },
  expectedStatus,
});

const client = await call("CLIENT", "tools/list");
const supplier = await call("SUPPLIER", "tools/list");
const clientNames = client.result.tools.map((tool) => tool.name);
const supplierNames = supplier.result.tools.map((tool) => tool.name);
invariant(clientNames.includes("room.read") && !clientNames.includes("opportunities.list"), "Client MCP tools leaked supplier access");
invariant(supplierNames.includes("opportunities.list") && !supplierNames.includes("room.read"), "Supplier MCP tools leaked client access");
await call("SUPPLIER", "tools/call", { name: "room.read", arguments: {} }, 403);
printSuccess("mcp:smoke", "role isolation enforced");
