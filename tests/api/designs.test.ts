import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../src/app/api/designs/route";

const previousMode = process.env.OBRIA_PROVIDER_MODE;
const previousKey = process.env.OPENAI_API_KEY;
const validRequest = () => new Request("http://localhost/api/designs", {
  method: "POST",
  body: JSON.stringify({
    sourceImageDataUri: "data:image/jpeg;base64,/9j/2Q==",
    request: "Deixar a sala mais clara e aconchegante.",
    roomType: "living_room",
    areaM2: 18,
    city: "São Paulo",
    uf: "SP",
    finishTier: "padrão",
  }),
});


afterEach(() => {
  if (previousMode === undefined) delete process.env.OBRIA_PROVIDER_MODE;
  else process.env.OBRIA_PROVIDER_MODE = previousMode;
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
  vi.restoreAllMocks();
});

describe("POST /api/designs", () => {
  it("fails closed when live generation is disabled", async () => {
    delete process.env.OBRIA_PROVIDER_MODE;
    delete process.env.OPENAI_API_KEY;

    const response = await POST(new Request("http://localhost/api/designs", { method: "POST", body: "{}" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: { message: "A geração de imagens não está habilitada neste ambiente.", retryable: false },
    });
  });

  it("does not accept requests without a server-side API key", async () => {
    process.env.OBRIA_PROVIDER_MODE = "live";
    delete process.env.OPENAI_API_KEY;

    const response = await POST(new Request("http://localhost/api/designs", { method: "POST", body: "{}" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: { message: "O serviço de imagens não está configurado.", retryable: false },
    });
  });

  it("rejects malformed JSON before contacting OpenAI", async () => {
    process.env.OBRIA_PROVIDER_MODE = "live";
    process.env.OPENAI_API_KEY = "test-key";

    const response = await POST(new Request("http://localhost/api/designs", { method: "POST", body: "{" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { message: "O pedido de geração não contém JSON válido.", retryable: false },
    });
  });

  it("rejects malformed image payloads returned by OpenAI", async () => {
    process.env.OBRIA_PROVIDER_MODE = "live";
    process.env.OPENAI_API_KEY = "test-key";
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({ data: [{ b64_json: 42 }] }));

    const response = await POST(validRequest());

    expect(response.status).toBe(502);
  });

  it("returns exactly two edits and limits changes to the client's request", async () => {
    process.env.OBRIA_PROVIDER_MODE = "live";
    process.env.OPENAI_API_KEY = "test-key";
    const submittedForms: FormData[] = [];
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
      submittedForms.push(init?.body as FormData);
      return Response.json({
        data: [
          { b64_json: "/9j/2Q==" },
          { b64_json: "/9j/2Q==" },
        ],
      });
    });

    const response = await POST(validRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      versions: [{ imageDataUri: "data:image/jpeg;base64,/9j/2Q==" }, { imageDataUri: "data:image/jpeg;base64,/9j/2Q==" }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(submittedForms[0]?.get("n")).toBe("2");
    const prompt = String(submittedForms[0]?.get("prompt"));
    expect(prompt).toContain("Altere exclusivamente os elementos solicitados pelo cliente");
    expect(prompt).toContain("Todo elemento não mencionado deve permanecer");
    expect(prompt).toContain("Não adicione melhorias, objetos ou decoração por iniciativa própria");
  });

  it("fails visibly before exceeding the Vercel response limit", async () => {
    process.env.OBRIA_PROVIDER_MODE = "live";
    process.env.OPENAI_API_KEY = "test-key";
    const oversizedBase64 = "A".repeat(2_000_004);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({ data: [{ b64_json: oversizedBase64 }, { b64_json: oversizedBase64 }] }));

    const response = await POST(validRequest());

    expect(response.status).toBe(502);
  });
});
