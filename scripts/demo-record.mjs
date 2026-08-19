import { request } from "./_http.mjs";

const state = await request("/api/demo");
process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
