import { describe, expect, it } from "vitest";
import {
  parseMarketplaceProject,
  serializeMarketplaceProject,
  type MarketplaceSessionProject,
} from "@/integrations/marketplace-session";

const project: MarketplaceSessionProject = {
  imageUrl: "data:image/jpeg;base64,/9j/2Q==",
  variantLabel: "A",
  title: "Conceito A",
  description: "Variação aplicada somente ao pedido informado.",
  roomLabel: "Sala",
  location: "São Paulo, SP",
  areaM2: null,
  finishLabel: null,
  request: "Adicione uma almofada azul sobre o sofá.",
};

describe("marketplace session handoff", () => {
  it("round-trips the selected generated proposal", () => {
    expect(parseMarketplaceProject(serializeMarketplaceProject(project))).toEqual(project);
  });

  it("rejects invalid or stale browser data", () => {
    expect(parseMarketplaceProject(null)).toBeNull();
    expect(parseMarketplaceProject("not-json")).toBeNull();
    expect(parseMarketplaceProject(JSON.stringify({ version: 1, imageUrl: "javascript:alert(1)" }))).toBeNull();
  });
});
