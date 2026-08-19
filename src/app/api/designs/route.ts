export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/edits";
const EDIT_COUNT = 2;

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

function readImageBase64List(payload: unknown, expectedCount: number) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
  const data = payload.data;
  if (!Array.isArray(data) || data.length !== expectedCount) return null;
  const encodedImages = data.map((image) => {
    if (!image || typeof image !== "object" || !("b64_json" in image)) return null;
    const encoded = image.b64_json;
    if (typeof encoded !== "string" || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
    return encoded;
  });
  return encodedImages.every((encoded): encoded is string => encoded !== null) ? encodedImages : null;
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
  if (body.areaM2 != null && (typeof body.areaM2 !== "number" || !Number.isFinite(body.areaM2) || body.areaM2 <= 0 || body.areaM2 > 1000)) return failure(400, "Informe uma área válida.");

  const imageBytes = Buffer.from(match[2], "base64");
  if (!imageBytes.length || imageBytes.length > 3 * 1024 * 1024) return failure(400, "A foto processada excedeu o limite de envio.");

  const mimeType = match[1];
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.slice("image/".length);
  const context = [
    `Pedido do cliente: ${instruction}`,
    `Ambiente: ${String(body.roomType ?? "não informado")}`,
    `Área aproximada: ${typeof body.areaM2 === "number" ? `${body.areaM2} m²` : "não informada"}`,
    `Local: ${String(body.city ?? "não informado")}/${String(body.uf ?? "")}`,
    `Acabamento: ${String(body.finishTier ?? "não informado")}`,
  ].join(". ");

  try {
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
    const form = new FormData();
    form.set("model", model);
    form.set("image", new Blob([imageBytes], { type: mimeType }), `ambiente.${extension}`);
    form.set("n", String(EDIT_COUNT));
    form.set("size", "auto");
    form.set("quality", process.env.OPENAI_IMAGE_QUALITY || "low");
    form.set("output_format", "jpeg");
    form.set("output_compression", process.env.OPENAI_IMAGE_COMPRESSION || "70");
    if (model !== "gpt-image-2") form.set("input_fidelity", "high");
    form.set("prompt", [
      "Edite a fotografia enviada usando a imagem original como fonte de verdade imutável.",
      `Pedido explícito do cliente: ${instruction}`,
      "Altere exclusivamente os elementos solicitados pelo cliente.",
      "Todo elemento não mencionado deve permanecer visualmente idêntico ao original, incluindo arquitetura, geometria, perspectiva, enquadramento, aberturas, piso, paredes, teto, iluminação, móveis, objetos e vista externa.",
      "Não remova, substitua, mova ou redesenhe nenhum elemento existente, exceto quando o pedido explícito exigir essa mudança.",
      "Não adicione melhorias, objetos ou decoração por iniciativa própria.",
      "As duas imagens podem variar somente na aparência do elemento explicitamente solicitado; todo o restante deve permanecer igual à fotografia original.",
      "Não adicione texto, legenda, marca d'água nem pessoas.",
      `Contexto descritivo, sem autorização para mudanças extras: ${context}`,
    ].join(" "));

    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const payload: unknown = await response.json();
    const encodedImages = readImageBase64List(payload, EDIT_COUNT);
    if (!response.ok || !encodedImages) throw new Error(`OpenAI image request failed with status ${response.status}`);
    const images = encodedImages.map((encoded) => ({ imageDataUri: `data:image/jpeg;base64,${encoded}` }));
    if (images.reduce((total, image) => total + image.imageDataUri.length, 0) > MAX_RESPONSE_IMAGE_CHARACTERS) {
      throw new Error("OpenAI image response exceeds the Vercel payload limit");
    }

    return Response.json({ projectId: crypto.randomUUID(), versions: images });
  } catch {
    return failure(502, "Não foi possível gerar as duas propostas agora. Tente novamente.", true);
  }
}
