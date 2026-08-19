import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MobileIntakeFlow } from "@/components/creation/mobile-intake-flow";

describe("MobileIntakeFlow", () => {
  it("renders a live camera surface immediately", () => {
    const markup = renderToStaticMarkup(React.createElement(MobileIntakeFlow));

    expect(markup).toContain("<video");
    expect(markup).toContain("autoPlay");
    expect(markup).toContain("playsInline");
  });
});
