import { invariant, printSuccess, request } from "./_http.mjs";

const first = await request("/api/demo", { method: "POST" });
const second = await request("/api/demo", { method: "POST" });
const wallClockFields = new Set(["at", "createdAt", "updatedAt", "collectedAt", "selectedAt"]);
const stable = (state) => JSON.stringify(state, (key, value) => wallClockFields.has(key) ? "<clock>" : value);
invariant(stable(first) === stable(second), "Two explicit resets produced different demo states");
printSuccess("demo:determinism", first.project.id);
