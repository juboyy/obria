import { createHash } from "node:crypto";
import { DomainError, type DesignPlan, type RoomAnalysis, type RoomBrief } from "@/domain/obria";
import { getDesignPlan } from "@/server/demo-store";

export type MediaJob = {
  provider: "replay" | "live";
  providerId: string;
  imageDataUri: string;
  plan: DesignPlan;
};

type CreateDesignInput = {
  brief: RoomBrief;
  iteration: number;
  prompt?: string;
  currentImageDataUri?: string;
};

export interface MediaProvider {
  analyzeRoom(brief: RoomBrief): Promise<RoomAnalysis>;
  createDesign(input: CreateDesignInput): Promise<MediaJob>;
}

const stableId = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);

export class ReplayMediaProvider implements MediaProvider {
  async analyzeRoom(): Promise<RoomAnalysis> {
    return {
      observed: ["sala retangular", "vão de luz lateral", "piso existente preservável", "paredes sem sinais de infiltração"],
      uncertainties: ["posição exata das tomadas", "estado do contrapiso sob o piso atual"],
      fixedElements: [
        { label: "vão principal", evidence: "abertura clara no lado direito da foto", confidence: 0.86 },
        { label: "piso existente", evidence: "continuidade visual do piso", confidence: 0.72 },
      ],
    };
  }

  async createDesign(input: CreateDesignInput): Promise<MediaJob> {
    const plan = getDesignPlan(input.iteration);
    const providerId = `replay-${stableId(JSON.stringify({ brief: input.brief, iteration: input.iteration, prompt: input.prompt ?? "" }))}`;
    const accent = input.iteration === 1 ? "#c9d4b2" : "#e7b68b";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="#f1eadf"/><path d="M0 820h1536v204H0z" fill="#8b5e45"/><path d="M110 120h1316v700H110z" fill="${accent}"/><path d="M200 240h600v500H200z" fill="#f8f4ee"/><path d="M940 350h340v390H940z" fill="#d5c4a8"/><circle cx="1160" cy="260" r="82" fill="#b5c8a4"/><text x="100" y="940" font-family="monospace" font-size="34" fill="#1b2421">OBRIA / REPLAY / V${input.iteration}</text></svg>`;
    return { provider: "replay", providerId, imageDataUri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, plan };
  }
}

function decodeImageDataUri(dataUri: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUri);
  if (!match) throw new DomainError("INVALID_SOURCE_IMAGE", "A imagem original deve ser JPEG, PNG ou WebP em base64", 400);
  return { mimeType: match[1]!, bytes: Buffer.from(match[2]!, "base64") };
}

export class LiveMediaProvider extends ReplayMediaProvider {
  async createDesign(input: CreateDesignInput): Promise<MediaJob> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new DomainError("IMAGE_PROVIDER_UNAVAILABLE", "OPENAI_API_KEY ausente; geração de imagem indisponível", 503);
    if (!input.currentImageDataUri) throw new DomainError("SOURCE_IMAGE_REQUIRED", "Envie uma foto do ambiente para gerar as propostas", 400);

    const source = decodeImageDataUri(input.currentImageDataUri);
    const plan = getDesignPlan(input.iteration);
    const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
    const outputFormat = process.env.OPENAI_IMAGE_FORMAT?.trim() || "webp";
    const quality = process.env.OPENAI_IMAGE_QUALITY?.trim() || "low";
    const compression = process.env.OPENAI_IMAGE_COMPRESSION?.trim() || "70";
    const prompt = [
      "Edite a fotografia do ambiente como uma visualização arquitetônica fotorrealista.",
      "Preserve rigorosamente câmera, perspectiva, paredes, portas, janelas, piso e todos os elementos estruturais.",
      "Altere apenas decoração, iluminação, cores, mobiliário e materiais solicitados.",
      plan.imagePrompt,
      input.prompt,
      `Crie uma alternativa visual distinta número ${input.iteration}.`,
      "Não adicione texto, legenda, moldura, marca d'água ou planta baixa.",
    ].filter(Boolean).join(" ");

    const form = new FormData();
    form.set("model", model);
    form.set("image", new Blob([source.bytes], { type: source.mimeType }), `ambiente.${source.mimeType.split("/")[1]}`);
    form.set("prompt", prompt);
    form.set("size", "1536x1024");
    form.set("quality", quality);
    form.set("output_format", outputFormat);
    if (outputFormat === "jpeg" || outputFormat === "webp") form.set("output_compression", compression);

    let response: Response;
    try {
      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: AbortSignal.timeout(180_000),
      });
    } catch (error) {
      throw new DomainError("IMAGE_PROVIDER_ERROR", error instanceof Error ? `Falha ao acessar a geração de imagens: ${error.message}` : "Falha ao acessar a geração de imagens", 502);
    }

    const payload = await response.json().catch(() => null) as { data?: Array<{ b64_json?: string }>; error?: { message?: string } } | null;
    const encoded = payload?.data?.[0]?.b64_json;
    if (!response.ok || !encoded) {
      const detail = payload?.error?.message?.slice(0, 300) || `HTTP ${response.status}`;
      throw new DomainError("IMAGE_PROVIDER_ERROR", `OpenAI não gerou a imagem: ${detail}`, 502);
    }

    const mimeType = outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "png" ? "image/png" : "image/webp";
    return {
      provider: "live",
      providerId: response.headers.get("x-request-id") || `openai-${stableId(encoded.slice(0, 256))}`,
      imageDataUri: `data:${mimeType};base64,${encoded}`,
      plan,
    };
  }
}

export function getMediaProvider(): MediaProvider {
  return process.env.OBRIA_PROVIDER_MODE === "live" ? new LiveMediaProvider() : new ReplayMediaProvider();
}
