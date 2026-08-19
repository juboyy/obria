# ObrIA: kit essencial de design

## Essência

- **Identidade canônica:** `ObrIA`. Esta grafia é obrigatória em títulos, interfaces, documentos e materiais de marca.
- **Conceito:** uma prancheta de obra no bolso.
- **Regras:** evidência antes de decoração; títulos editoriais com dados técnicos; um único hue de ação verde mineral.
- **Proibido:** gradiente roxo, glass, neon, blur, dashboard genérico, chat, cantos excessivamente arredondados e clichês de casa, cérebro, robô ou brilho de IA.
- **Identidades legadas:** `O·IA`, `OIA`, `obria`, `Obra Clara` e `OC`. Nenhuma substitui `ObrIA`.

## Logo

O mark combina um esquadro com a leitura de `IA`. O esquadro representa precisão de obra. A perna vertical verde forma o `I`. O corpo triangular grafite, com o recorte interno, forma o `A`.

SVG copiável do mark:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="obria-mark-title">
  <title id="obria-mark-title">ObrIA</title>
  <path fill="#2B312C" fill-rule="evenodd" d="M8 8V56H56L8 8ZM20 30L34 44H20V30Z"/>
  <path fill="#46644E" d="M8 8h8v48H8z"/>
</svg>
```

- **Wordmark:** `Obr` em serif 700 e `IA` em sans 700. Usar sempre a grafia `ObrIA`. Para um mark de 32 px, manter gap de 12 px entre mark e wordmark.
- **Variantes:** primária, grafite + verde sobre marfim; monocromática, em `currentColor`; reversa, marfim sobre grafite. Não criar outras variantes.
- **Área e escala:** reservar área livre de `1/4` da altura do mark em todos os lados; mark mínimo de 16 px; lockup mínimo de 24 px.
- **Integridade:** não rotacionar, contornar, arredondar, sombrear ou recolorir por produto.

## Fundações

```css
:root {
  --obria-color-canvas: #F3EFE5;
  --obria-color-surface: #FFFDF7;
  --obria-color-sunken: #E6DFD0;
  --obria-color-text: #2B312C;
  --obria-color-muted: #626A63;
  --obria-color-border: #CEC8BA;
  --obria-color-control-border: #858C86;
  --obria-color-action: #46644E;
  --obria-color-action-hover: #36513E;
  --obria-color-action-soft: #DDE5DC;
  --obria-color-on-action: #FFFDF7;
  --obria-color-warning: #7A5A24;
  --obria-color-danger: #A94F34;

  --obria-font-display: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --obria-font-body: Aptos, "Segoe UI", sans-serif;
  --obria-font-data: "Cascadia Mono", Consolas, monospace;

  --obria-type-12-16: 12px/16px;
  --obria-type-14-20: 14px/20px;
  --obria-type-16-24: 16px/24px;
  --obria-type-24-28: 24px/28px;
  --obria-type-32-34: 32px/34px;
  --obria-type-hero: clamp(36px, 8vw, 44px)/1;

  --obria-space-4: 4px;
  --obria-space-8: 8px;
  --obria-space-12: 12px;
  --obria-space-16: 16px;
  --obria-space-24: 24px;
  --obria-space-32: 32px;
  --obria-space-48: 48px;
  --obria-space-64: 64px;

  --obria-radius-0: 0;
  --obria-radius-2: 2px;
  --obria-radius-4: 4px;
  --obria-control-min: 44px;
  --obria-control-default: 48px;
  --obria-control-cta: 54px;
}
```

- **Contrastes de orientação:** text/canvas `11.59:1`; muted/canvas `4.86:1`; action/canvas `5.73:1`; on-action/action `6.47:1`; danger/canvas `4.74:1`; control-border/canvas `3.00:1`.
- **Uso de muted:** somente sobre canvas ou surface em conteúdo ativo.

## Componentes essenciais

- **Botões:** primário com 54 px, action + on-action; secundário com 48 px, surface + control-border; foco com outline action de 3 px e offset de 3 px; disabled com sunken + muted, sem depender apenas de opacidade.
- **Campo e textarea:** label visível, mínimo de 48 px, control-border, helper ou erro textual; o erro deve ser referenciado por `aria-describedby`.
- **Card de material:** ordem fixa `produto`, `fornecedor`, `SKU`, `preço`, `prazo`, `válido até`; selected usa borda action de 2 px mais texto ou ícone.
- **Hotspot:** alvo de 44 x 44 px; número on-action sobre action; halo surface de 3 px; contorno text de 1 px para funcionar sobre foto.
- **Aprovação e proposta:** exibir `APROVADA`, responsável e timestamp, seguidos de subtotal, frete quando disponível, total, prazo, validade, premissas, exclusões e hash.

## Acessibilidade

- [ ] Cumprir WCAG AA.
- [ ] Manter foco visível em toda interação de teclado.
- [ ] Usar alvo mínimo de 44 x 44 px.
- [ ] Comunicar estados com mais do que cor, usando texto, ícone ou estrutura.
- [ ] Usar `aria-live="polite"` para transcrição, cotação e geração.
- [ ] Respeitar `prefers-reduced-motion`.
- [ ] Respeitar a safe area inferior com `env(safe-area-inset-bottom)`.
- [ ] Não exigir hover, swipe ou rolagem horizontal.

## Checklist

- [ ] A grafia `ObrIA` está correta em todo o uso.
- [ ] O mark permanece legível a 16 px.
- [ ] Há um único CTA primário por estado.
- [ ] Os seis dados do material estão presentes: produto, fornecedor, SKU, preço, prazo e válido até.
- [ ] Nenhum valor de cor aparece fora dos tokens `--obria-`.
- [ ] Nenhum padrão visual proibido aparece na aplicação.
