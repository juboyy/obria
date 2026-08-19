import type {
  DualEstimateResponse,
  FinishTier,
  MarketplaceProjectPost,
  RoomType,
} from "@/types";
import { validateArea, validateBriefing } from "./project-input-validation";

export type ProjectLocation = {
  source: "current" | "manual";
  label: string;
  city?: string;
  uf?: string;
  coordinates?: { latitude: number; longitude: number };
};

export type ProjectDraft = {
  location: ProjectLocation | null;
  roomType: RoomType | null;
  roomLabel: string;
  areaM2: number | null;
  finishTier: FinishTier | null;
  instruction: string;
};

export type GenerationVariant = {
  id: string;
  generationId: string;
  ordinal: number;
  label: string;
  titlePtBr: string;
  descriptionPtBr: string;
  image: {
    id: string;
    url: string;
    mimeType: "image/jpeg";
    altPtBr: string;
    privacy: "private_signed_url";
  };
};

export type GenerateProjectInput = ProjectDraft & { originalImage: File };
export type GenerateProjectResult = { projectId: string; variants: GenerationVariant[] };
export type RefineProjectInput = { projectId: string; parentVariantId: string; instruction: string; audio?: Blob };
export type EstimateProjectInput = { projectId: string; draft: ProjectDraft; approvedVariantId: string };
export type PublishProjectInput = {
  projectId: string;
  draft: ProjectDraft;
  approvedVariantId: string;
  estimatePreference: "economic" | "ecological";
  estimates: DualEstimateResponse;
  consent: true;
};

export interface ProjectFlowGateway {
  generateProject(input: GenerateProjectInput): Promise<GenerateProjectResult>;
  refineProject(input: RefineProjectInput): Promise<GenerationVariant>;
  calculateEstimates(input: EstimateProjectInput): Promise<DualEstimateResponse>;
  transcribeAudio(audio: Blob): Promise<{ transcript: string }>;
  publishProject(input: PublishProjectInput): Promise<MarketplaceProjectPost>;
}

type DesignsResponse = {
  projectId: string;
  versions: Array<{ imageDataUri: string }>;
};

const VARIANT_LABELS = ["A", "B"] as const;
const SUPPORTED_IMAGE_TYPES: Record<string, true> = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
};

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Não foi possível ler a foto enviada."));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto enviada."));
    reader.readAsDataURL(file);
  });
}

function readApiError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return null;
  const error = payload.error;
  if (!error || typeof error !== "object" || !("message" in error)) return null;
  return typeof error.message === "string" ? error.message : null;
}

function parseDesignsResponse(payload: unknown): DesignsResponse {
  if (!payload || typeof payload !== "object") throw new Error("O serviço de imagens retornou uma resposta inválida.");
  const projectId = "projectId" in payload ? payload.projectId : null;
  const versions = "versions" in payload ? payload.versions : null;
  if (typeof projectId !== "string" || !projectId || !Array.isArray(versions) || versions.length !== 2) {
    throw new Error("O serviço de imagens não retornou as duas propostas esperadas.");
  }
  const parsedVersions = versions.map((version) => {
    if (!version || typeof version !== "object" || !("imageDataUri" in version)) {
      throw new Error("O serviço de imagens retornou uma proposta inválida.");
    }
    const imageDataUri = version.imageDataUri;
    if (typeof imageDataUri !== "string" || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(imageDataUri)) {
      throw new Error("O serviço de imagens retornou uma proposta inválida.");
    }
    return { imageDataUri };
  });
  return { projectId, versions: parsedVersions };
}

function unavailable(feature: string): Promise<never> {
  return Promise.reject(new Error(`${feature} ainda não está disponível nesta experiência.`));
}

export function createHttpProjectFlowGateway(baseUrl = ""): ProjectFlowGateway {
  return {
    async generateProject(input) {
      if (!SUPPORTED_IMAGE_TYPES[input.originalImage.type]) {
        throw new Error("Envie uma foto JPG, PNG ou WebP válida.");
      }
      if (!input.location || !input.roomType || !input.finishTier || input.areaM2 === null) {
        throw new Error("Complete os dados do ambiente antes de gerar as propostas.");
      }
      const areaError = validateArea(String(input.areaM2));
      if (areaError) throw new Error(areaError);
      const briefingError = validateBriefing(input.instruction);
      if (briefingError) throw new Error(briefingError);

      const sourceImageDataUri = await fileToDataUri(input.originalImage);
      const response = await fetch(`${baseUrl}/api/designs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceImageDataUri,
          request: input.instruction.trim(),
          roomType: input.roomType,
          areaM2: input.areaM2,
          city: input.location.city ?? input.location.label,
          uf: input.location.uf ?? "",
          finishTier: input.finishTier,
        }),
      });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error("O serviço de imagens retornou uma resposta inválida.");
      }
      if (!response.ok) throw new Error(readApiError(payload) ?? "Não foi possível gerar as propostas agora.");

      const result = parseDesignsResponse(payload);
      const generationId = `${result.projectId}-generation-1`;
      return {
        projectId: result.projectId,
        variants: result.versions.map(({ imageDataUri }, index) => {
          const ordinal = index + 1;
          const label = VARIANT_LABELS[index];
          return {
            id: `${result.projectId}-variant-${ordinal}`,
            generationId,
            ordinal,
            label,
            titlePtBr: `Conceito ${label}`,
            descriptionPtBr: `Variação ${ordinal} de 2 aplicada somente ao pedido informado.`,
            image: {
              id: `${result.projectId}-image-${ordinal}`,
              url: imageDataUri,
              mimeType: "image/jpeg" as const,
              altPtBr: `Conceito ${label} gerado para o ambiente enviado`,
              privacy: "private_signed_url" as const,
            },
          };
        }),
      };
    },
    refineProject: () => unavailable("O refinamento de imagem"),
    calculateEstimates: () => unavailable("O cálculo de estimativas"),
    transcribeAudio: () => unavailable("A transcrição de áudio"),
    publishProject: () => unavailable("A publicação no marketplace"),
  };
}

export const projectFlowGateway: ProjectFlowGateway = createHttpProjectFlowGateway();
