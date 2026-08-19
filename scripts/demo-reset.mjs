import { printSuccess, request } from "./_http.mjs";

const state = await request("/api/demo", { method: "POST" });
printSuccess("demo:reset", `${state.project.id} · ${state.project.state}`);
