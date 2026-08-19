export const baseUrl = (process.env.OBRIA_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

export async function request(path, { method = "GET", role = "CLIENT", body, headers = {}, expectedStatus } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "x-obria-role": role,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (expectedStatus !== undefined) {
    invariant(response.status === expectedStatus, `${method} ${path}: expected HTTP ${expectedStatus}, received ${response.status}: ${text}`);
  } else {
    invariant(response.ok, `${method} ${path}: HTTP ${response.status}: ${text}`);
  }
  return payload;
}

export function printSuccess(name, details = "") {
  process.stdout.write(`${name}: OK${details ? ` · ${details}` : ""}\n`);
}
