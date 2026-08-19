export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";
const CONCEPT_DIRECTIONS = [
  "Luz de fim de tarde: paredes claras, madeira suave, luz natural quente e um ambiente arejado.",
  "Texturas honestas: base neutra, cerâmica artesanal, materiais naturais e contraste tátil contido.",
  "Verde silencioso: biofilia elegante, plantas bem integradas, luz quente e preservação do que já existe.",
  "Contraste essencial: um gesto terroso marcante, composição sóbria e alto impacto sem reforma estrutural.",
] as const;

type DesignRequest = {
  sourceImageDataUri?: unknown;
  request?: unknown;
  roomType?: unknown;
  areaM2?: unknown;
  city?: unknown;
  uf?: unknown;
  finishTier?: unknown;
};

const MAX_RESPONSE_IMAGE_CHARACTERS = 4_000_000;

function readImageBase64(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
  const data = payload.data;
  if (!Array.isArray(data) || !data[0] || typeof data[0] !== "object" || !("b64_json" in data[0])) return null;
  const encoded = data[0].b64_json;
  if (typeof encoded !== "string" || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  return encoded;
}

function failure(status: number, message: string, retryable = false) {
  return Response.json({ error: { message, retryable } }, { status });
}

export async function POST(request: Request) {
  if (process.env.OBRIA_PROVIDER_MODE !== "live") {
    return failure(503, "A geração de imagens não está habilitada neste ambiente.");
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return failure(503, "O serviço de imagens não está configurado.");
  }

  let body: DesignRequest;
  try {
    body = (await request.json()) as DesignRequest;
  } catch {
    return failure(400, "O pedido de geração não contém JSON válido.");
  }

  const sourceImageDataUri = typeof body.sourceImageDataUri === "string" ? body.sourceImageDataUri : "";
  const instruction = typeof body.request === "string" ? body.request.trim() : "";
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(sourceImageDataUri);
  if (!match) return failure(400, "Envie uma foto JPG, PNG ou WebP válida.");
  if (instruction.length < 10 || instruction.length > 800) return failure(400, "Descreva a mudança desejada em 10 a 800 caracteres.");
  if (typeof body.areaM2 !== "number" || !Number.isFinite(body.areaM2) || body.areaM2 <= 0 || body.areaM2 > 1000) return failure(400, "Informe uma área válida.");

  const imageBytes = Buffer.from(match[2], "base64");
  if (!imageBytes.length || imageBytes.length > 3 * 1024 * 1024) return failure(400, "A foto processada excedeu o limite de envio.");

  const mimeType = match[1];
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.slice("image/".length);
  const context = [
    `Pedido do cliente: ${instruction}`,
    `Ambiente: ${String(body.roomType ?? "não informado")}`,
    `Área aproximada: ${body.areaM2} m²`,
    `Local: ${String(body.city ?? "não informado")}/${String(body.uf ?? "")}`,
    `Acabamento: ${String(body.finishTier ?? "não informado")}`,
  ].join(". ");

  try {
    const images = await Promise.all(CONCEPT_DIRECTIONS.map(async (direction, index) => {
      const form = new FormData();
      form.set("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-2");
      form.set("image", new Blob([imageBytes], { type: mimeType }), `ambiente.${extension}`);
      form.set("size", "1024x1024");
      form.set("quality", process.env.OPENAI_IMAGE_QUALITY || "low");
      form.set("output_format", "jpeg");
      form.set("output_compression", process.env.OPENAI_IMAGE_COMPRESSION || "70");
      form.set("prompt", [
        "Edite a fotografia enviada e produza uma visualização fotorrealista de renovação residencial.",
        "Preserve rigorosamente a arquitetura, dimensões, aberturas, perspectiva e enquadramento da foto original.",
        "Não adicione texto, legenda, marca d'água, pessoas nem alterações estruturais.",
        context,
        `Conceito ${index + 1} de 4 — ${direction}`,
        "O resultado deve ser claramente diferente dos outros conceitos pela paleta, materiais, iluminação e decoração.",
      ].join(" "));

      const response = await fetch(OPENAI_IMAGES_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      const payload: unknown = await response.json();
      const encoded = readImageBase64(payload);
      if (!response.ok || !encoded) throw new Error(`OpenAI image request failed with status ${response.status}`);
      return { imageDataUri: `data:image/jpeg;base64,${encoded}` };
    }));
    if (images.reduce((total, image) => total + image.imageDataUri.length, 0) > MAX_RESPONSE_IMAGE_CHARACTERS) {
      throw new Error("OpenAI image response exceeds the Vercel payload limit");
    }

    return Response.json({ projectId: crypto.randomUUID(), versions: images });
  } catch {
    return failure(502, "Não foi possível gerar as quatro propostas agora. Tente novamente.", true);
  }
}
