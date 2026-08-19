# Obra Clara — Product Requirements Document

> Visualize the change. Compare the trade-offs. Find who can build it.

| Field | Value |
| --- | --- |
| Version | 2.0 — revised MVP |
| Status | Build-ready |
| Date | 2026-08-19 |
| Team | Three people, supported by coding agents |
| Hackathon challenge | Pequenos Negócios |
| Build deadline | Today; six-hour implementation target |
| Product language | Portuguese (Brazil) |
| Code/documentation language | English |
| Deployment | Vercel |
| Data and media | Supabase |
| AI | OpenAI Image API and Responses API Structured Outputs |

This document supersedes PRD v1. It incorporates the marketplace prototype, sustainability education, two estimate profiles, and a three-person delivery model.

## 1. Executive summary

Obra Clara is an end-to-end renovation planning experience for Brazilian homeowners and small construction professionals.

The user takes or uploads a photograph of one room, explains what they want to change, and receives four photorealistic visual proposals. They choose a preferred proposal and can iterate on it. The application then converts the confirmed request into a transparent work scope and produces two preliminary estimates:

1. **Mais econômica:** prioritizes the lowest reasonable upfront cost.
2. **Mais ecológica:** substitutes supported items with curated alternatives that favor reuse, reduced waste, energy/water efficiency, or lower-impact material choices.

The user compares cost and trade-offs, chooses a preferred plan, and publishes the resulting project brief into a Fiverr-like contractor marketplace prototype. The marketplace is UI-only for this hackathon: it demonstrates how the structured project would be posted and matched, but it does not claim live professionals, contracting, payments, or messaging.

The complete MVP story is:

> Photo → request → four visual options → selection → refinement → confirmed scope → economical and ecological estimates → marketplace project post.

## 2. Product recommendations and locked decisions

### 2.1 Keep one story, not three products

The visual editor, dual estimate, sustainability education, and marketplace must feel like stages of one project. The marketplace is the conversion destination for the structured brief, not a separate product competing for demo time.

The live pitch should be:

> “Obra Clara takes a renovation idea from imagination to an actionable, contractor-ready project brief.”

### 2.2 The marketplace is a prototype, but it must be believable

P0 includes:

- A prefilled project-post preview.
- Privacy and timing questions.
- A working `Publicar pedido` interaction.
- A success state.
- A Fiverr-style feed of clearly fictional demonstration professionals and proposal cards.
- Client-side navigation and card interactions.

P0 does not include:

- Real contractors.
- Search infrastructure.
- Real matching.
- Messaging.
- Payments.
- Reviews.
- Notifications.
- Legal contracting.

The demo must say “marketplace prototype” and label sample profiles `Perfil demonstrativo`.

### 2.3 Use “estimativa,” not a binding “quote”

The user-facing result can feel like a quote experience, but its correct product name is `Estimativa preliminar`. A photograph cannot reveal dimensions, substrate conditions, structural constraints, access, permits, or hidden systems.

Required disclaimer:

> “Estimativa preliminar para planejamento. Não substitui medição, vistoria técnica ou orçamento executivo de um profissional.”

### 2.4 Sustainability must be educational and defensible

The ecological profile must not invent carbon savings, energy savings, certifications, or lifecycle payback. For P0:

- Use a curated catalogue of alternative choices.
- Explain why each choice may be preferable.
- Show the upfront price difference.
- Use qualitative impact categories.
- State when a benefit depends on supplier verification or correct installation.
- Never display an unsupported universal `eco score`.

### 2.5 Divide the team by balanced vertical slices

Do not assign one person only to the marketplace. It is lighter than the core visual flow. Use:

1. **Creation Experience and Integration**
2. **AI, Media, and Structured Questions**
3. **Dual Estimate and Marketplace Handoff**

Detailed ownership is defined in section 20.

## 3. Challenge alignment and hackathon compliance

### 3.1 Primary category: Pequenos Negócios

Obra Clara helps small contractors, architects, and interior designers qualify opportunities, align visual expectations, educate clients about alternatives, and receive a structured project brief before a site visit.

The homeowner is the immediate user; the local professional is the operational beneficiary.

### 3.2 Differentiation

AI interior visualization exists. Obra Clara’s differentiated chain is:

```text
visual intent
  → user selection
  → controlled renovation scope
  → two transparent trade-off profiles
  → contractor-ready marketplace brief
```

### 3.3 Avoid prohibited-project framing

The app must not be pitched as an image analyzer.

- It does not measure the room from pixels.
- It does not assess structural or technical feasibility.
- It does not produce image analysis as the primary result.
- It transforms a user-provided scene and structures written intent.
- It is a guided transaction flow, not a dashboard.

### 3.4 Evidence of hackathon work

- Public repository.
- Meaningful commits created during the event.
- `docs/BUILD_LOG.md` with timestamps and owners.
- README listing what was built during the event.
- Only owned, licensed, or openly reusable assets.
- UI-only marketplace clearly identified as such.
- Demo distinguishes live functionality from seeded content.

## 4. Users and jobs to be done

### 4.1 Primary user: homeowner planning a change

**Job:**

> When I am considering a renovation, help me understand what I want, see credible alternatives, compare financial and ecological trade-offs, and create a useful request for professionals.

**Needs:**

- Camera-first simplicity.
- Nontechnical language.
- Visual control and iteration.
- Honest cost ranges.
- Clear ecological choices without guilt or greenwashing.
- One artifact they can send to contractors.

### 4.2 Marketplace user: small renovation professional

**Job:**

> When I evaluate a new client request, give me enough structured information to decide whether the project fits before I spend time on a visit or proposal.

**Needs represented in the project post:**

- City/UF, never exact public address.
- Room type and approximate area.
- Original and selected concept images.
- Confirmed work scope.
- Preferred estimate profile and range.
- Timing and flexibility.
- Explicit assumptions and exclusions.

## 5. Product principles

1. **One uninterrupted journey.** Every step reuses prior decisions.
2. **Four options create agency.** The model proposes; the user chooses.
3. **Ask only questions that change the result.** Avoid generic chatbot behavior.
4. **Confirm scope before money.** Model interpretation is never silently priced.
5. **Compare trade-offs, not morality.** Economic and ecological plans are both valid choices.
6. **Teach at the decision point.** Explain ecological alternatives where the user can act.
7. **No false precision.** Show ranges, assumptions, sources, and exclusions.
8. **The final artifact is reusable.** The marketplace post should be created from existing project data, not a second form.
9. **Build for the demo clock.** Waiting and fallback states are product features.

## 6. Goals, non-goals, and success metrics

### 6.1 P0 goals

- Capture one room photo and a renovation brief.
- Generate four edited visual alternatives.
- Let the user choose one and perform one visible refinement cycle.
- Ask structured follow-up questions only where required for pricing.
- Produce a user-confirmed work scope.
- Calculate economical and ecological preliminary estimates.
- Explain the difference between the estimates by line item.
- Let the user select a plan and preview/publish a marketplace project.
- Show a polished marketplace prototype with demo profiles.
- Deploy the complete flow publicly.

### 6.2 Non-goals

- Real contractor onboarding or verification.
- Live marketplace search, matching, bids, or messages.
- Payments, escrow, contracts, scheduling, or dispute resolution.
- Binding construction quotations.
- Pixel-derived room measurement.
- Carbon footprint calculation.
- Lifecycle-cost or energy-payback calculation without verified data.
- Architectural, structural, electrical, hydraulic, or legal approval.
- Multiple rooms.
- Floor plans, BIM, CAD, 3D, AR, or VR.
- Authentication beyond an anonymous secure project session.
- A generic conversational assistant.
- Live SINAPI ingestion during user requests.

### 6.3 Success metrics

| Metric | P0 target |
| --- | --- |
| Complete happy path | One live project reaches marketplace success state |
| Initial data entry | Under 60 seconds with sample project |
| Visual output | Four candidates in one generation |
| Selection and refinement | Selected image becomes the next source |
| Scope safety | 100% of priced items confirmed by user or deterministic rules |
| Dual estimate | Both profiles use the same scope and deterministic price catalogue |
| Sustainability transparency | Every ecological substitution has reason, trade-off, and impact category |
| Marketplace reuse | Post is prefilled from project data; no duplicate scope entry |
| Mobile usability | Complete flow at 390 px |
| Demo reliability | Saved sample, retry path, and stable completed project available |

## 7. Scope and cut ladder

### 7.1 P0 — required

- Portuguese guided flow.
- Responsive design and basic accessibility.
- Private image upload.
- Four initial concepts.
- Candidate selection and before/after view.
- One refinement round supported through the same generation endpoint.
- Controlled scope extraction.
- Maximum three clarifying questions.
- Editable scope confirmation.
- Economic estimate.
- Ecological estimate using curated alternatives.
- Estimate comparison.
- Preferred-plan selection.
- Prefilled marketplace project preview.
- Marketplace publish success state.
- Seeded Fiverr-style contractor/proposal UI.
- Public deployment, README, build log, demo script.

### 7.2 P1 — only after P0 passes end to end

- Second refinement round.
- Download selected image.
- Print or PDF estimate.
- CEP lookup.
- Working client-side marketplace filters.
- Contractor profile detail drawer.
- Copyable project share text.
- Project history thumbnails.

### 7.3 Cut order when time slips

1. Cut PDF, download, share, transitions, filters, profile detail.
2. Reduce marketplace to post preview, success state, and three cards.
3. Reduce ecological education to three best-supported substitutions.
4. Fall back from model-extracted scope to an editable deterministic checklist.
5. Limit refresh recovery to the active browser session.
6. Preserve at all costs: four images, selection, one refinement, dual estimate, marketplace post, production deployment.

Do not use the final deployment and rehearsal hour to rescue P1.

## 8. Happy path

```mermaid
flowchart LR
  A[Take or upload photo] --> B[Describe the change]
  B --> C[Receive four concepts]
  C --> D[Choose one]
  D --> E[Request focused refinement]
  E --> F[Approve selected visual]
  F --> G[Answer up to three scope questions]
  G --> H[Confirm work scope]
  H --> I[Compare economical and ecological estimates]
  I --> J[Choose preferred approach]
  J --> K[Preview contractor-ready post]
  K --> L[Publish to marketplace prototype]
```

### 8.1 Application states

```text
INTAKE
UPLOADING
READY_TO_GENERATE
GENERATING_INITIAL
REVIEWING_OPTIONS
GENERATING_REFINEMENT
REVIEWING_REFINEMENT
CLARIFYING_SCOPE
CONFIRMING_SCOPE
CALCULATING_ESTIMATES
COMPARING_ESTIMATES
PREVIEWING_MARKETPLACE_POST
MARKETPLACE_POSTED_DEMO
ERROR
```

Errors return to the latest stable state without deleting completed generations.

## 9. UX and UI specification

### 9.1 Experience structure

Use one project workspace with six user-visible stages:

```text
Seu espaço → Ideias → Ajustes → Escopo → Estimativas → Profissionais
```

The stepper is informational, not a set of freely navigable tabs while required data is incomplete.

### 9.2 Screen 1 — “Transforme seu espaço”

**Purpose:** Capture a photo and the minimum context.

**Fields:**

- Room photo, required.
- City and UF, required.
- Room type, required: sala, quarto, cozinha, banheiro, escritório, outro.
- Approximate floor area in m², required.
- Finish level: econômico, padrão, premium.
- Desired changes, 10–800 characters.

**Primary CTA:** `Criar 4 propostas`

**Photo behavior:**

- Camera-first on mobile.
- File drop/select on desktop.
- Normalize to JPEG, maximum 2048 px long edge, target below 5 MB.
- Re-encode to remove EXIF/GPS metadata.
- Show preview and replacement action.

**Prompt chips:**

- “Trocar piso”
- “Pintar paredes”
- “Melhorar iluminação”
- “Mais aconchegante”
- “Estilo contemporâneo”
- “Preservar o que já existe”

### 9.3 Ecological nudge on intake

Show one subtle, dismissible card after the user describes the change:

> `Quer reduzir desperdício?` Considere preservar ou renovar elementos existentes antes de substituir tudo.

Actions:

- `Adicionar ao pedido`
- `Agora não`

This nudge appends editable language to the request. It never changes the project silently.

Do not show more than one nudge on intake.

### 9.4 Generation progress

- Four stable aspect-ratio skeletons.
- Original photo remains visible.
- Indeterminate stages; no fake percentage.
- Elapsed-time note after 15 seconds.
- After 90 seconds, explain that detailed edits may take a few minutes.
- Disable duplicate requests.
- Preserve the form if generation fails.

Copy sequence:

1. “Preparando a foto…”
2. “Preservando a estrutura do ambiente…”
3. “Criando quatro caminhos visuais…”
4. “Finalizando materiais e luz…”

### 9.5 Four-option gallery

- 2×2 desktop grid; one-column mobile list.
- Labels A, B, C, D.
- Large image dialog.
- `Comparar com original` slider or side-by-side view.
- One selected card with border, icon, and `Selecionada` label.
- Sticky CTA: `Continuar com esta proposta`.

Do not assign unsupported cost or sustainability claims to generated images.

### 9.6 Refinement

Focused composer:

> `O que você quer ajustar nesta versão?`

Suggestions:

- “Mais luz natural”
- “Menos mudanças”
- “Preserve o piso atual”
- “Troque apenas a cor das paredes”
- “Use materiais de aparência natural”

Actions:

- `Gerar novos ajustes`
- `Aprovar e calcular estimativas`

The selected generated image is the next source. The initial prompt history remains stored, but the refinement is compiled as a delta: preserve the current result and change only what was requested.

### 9.7 Clarifying questions

Ask at most three questions, presented as a compact form—not a chat.

Only ask questions needed by a selected scope rule. Examples:

- “Quantos pontos de iluminação deseja alterar?”
- “O piso será removido ou instalado sobre o atual?”
- “Deseja pintar também o teto?”

Rules:

- Use closed choices or numeric inputs.
- Display why the answer matters: `Isso altera a estimativa`.
- Offer a visible assumption when the user skips.
- Do not ask style questions after the visual has already been approved.

### 9.8 Scope confirmation

For each item show:

- Work category.
- Quantity and unit.
- Quantity source: informed, calculated, or assumed.
- Edit/remove action.
- Unsupported/specialist warning when applicable.

Example:

```text
✓ Pintura de paredes
  50,4 m²
  Calculado: 18 m² de piso × fator 2,8

✓ Instalação de piso
  19,8 m²
  Calculado: 18 m² + 10% de perda

! Marcenaria sob medida
  Requer medidas e proposta de fornecedor; fora da estimativa automática.
```

CTA: `Comparar estimativas`

### 9.9 Dual-estimate comparison

Headline:

> `Duas formas de realizar seu projeto`

Cards:

#### Card A — Mais econômica

- Expected total.
- Low/high range.
- “Menor investimento inicial.”
- Conventional supported choices.
- Line-item accordion.

#### Card B — Mais ecológica

- Expected total.
- Difference from economic profile: `+R$ X` or `−R$ X`.
- Qualitative benefits by category.
- Trade-offs and verification notes.
- Line-item accordion with changed items highlighted.

Do not preselect the ecological option. Let the user choose:

- `Prefiro economia`
- `Prefiro escolhas ecológicas`
- `Quero receber propostas para as duas`

The third option is recommended for marketplace posting because contractors can refine both approaches.

### 9.10 Educational comparison behavior

Each ecological substitution expands to:

```text
What changes
Why it may help
Upfront cost difference
Impact categories
What to confirm with the contractor/supplier
Source/method note
```

Example:

> **Restaurar o piso existente em vez de remover**  
> Pode evitar descarte e compra de material novo. A viabilidade depende do estado atual e deve ser confirmada na vistoria.  
> Impacto potencial: menos resíduos, menos material novo.

Avoid guilt language such as “the right choice.”

### 9.11 Marketplace post preview

The post is prefilled from the project. The user answers only:

- When they hope to start: urgente, até 30 dias, 1–3 meses, pesquisando.
- Whether dates are flexible.
- Whether contractors may propose equivalent alternatives.
- Preferred plan: economic, ecological, or both.
- Optional short note, maximum 300 characters.

Preview content:

- Selected concept cover image.
- Optional original image thumbnail.
- Title generated from room and scope, editable.
- City/UF only; no exact public address.
- Approximate area.
- Scope summary.
- Preferred plan and estimate range.
- Sustainability preferences.
- Assumptions and specialist exclusions.

Consent checkbox:

> “Autorizo a exibição deste pedido e das imagens no protótipo do marketplace.”

CTA: `Publicar pedido`

### 9.12 Marketplace success and feed

Success state:

> `Seu pedido está pronto para receber propostas`

Subcopy must identify the hackathon boundary:

> “Neste protótipo, os perfis e propostas abaixo são demonstrativos.”

Display:

- Published project card.
- Three sample proposal cards.
- Six sample professional cards in a responsive grid if time permits.
- Service, city/UF, response time, rating presentation, eco-experience badge, and portfolio thumbnails.
- Buttons open a details drawer or show `Funcionalidade futura`.

Seeded professional data must be fictional and clearly labeled.

## 10. Visual design system

### 10.1 Direction

The product should feel like a calm architectural consultation: large images, warm neutral background, clear typography, restrained color, and editorial spacing. The marketplace uses the same system; it must not look like a separate template.

Avoid generic AI gradients, dark dashboards, and visual clutter.

### 10.2 Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| Canvas | `#F4F1EA` | Warm background |
| Surface | `#FFFFFF` | Forms/cards |
| Ink | `#202622` | Primary text |
| Muted | `#66706A` | Secondary text |
| Primary | `#B95232` | Main actions/selection |
| Primary soft | `#F3DDD5` | Selected chips |
| Eco | `#58725A` | Ecological alternative accents |
| Eco soft | `#E5ECE3` | Eco backgrounds |
| Border | `#D9D7D0` | Dividers |
| Danger | `#B42318` | Errors |

Confirm accessible contrast. Status never relies only on color.

### 10.3 Primitives

- Button
- Card
- Input/Textarea
- Select
- Checkbox/Radio Group
- Badge
- Skeleton
- Dialog/Drawer
- Accordion
- Alert/Toast
- Tabs only on marketplace browsing, not main flow

### 10.4 Accessibility

- 44×44 px minimum touch targets.
- Visible focus.
- Keyboard-selectable image cards.
- Labels and described errors.
- `aria-live="polite"` for generation status.
- Reduced-motion support.
- Image alt text identifies proposal letter and project context.
- All essential content remains readable without hover.

## 11. Functional requirements

### FR-01 — anonymous project session

- Secure signed HttpOnly cookie.
- Random project UUID.
- Server verifies project ownership on every route.
- Production cookie is Secure and SameSite=Lax.

### FR-02 — image upload

- JPEG/PNG/WebP; HEIC only when conversion works.
- Client normalization below 5 MB.
- Private Supabase bucket.
- Signed upload URL.
- Generated server-side path.
- Signed reads, 60-minute expiry.

Supabase recommends standard uploads for files no larger than 6 MB. See [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads).

### FR-03 — four initial concepts

- Source image plus compiled preservation prompt.
- `n=4` in one Image Edit request when validated.
- Environment-configurable image model/quality/format.
- Default `gpt-image-2`, medium, JPEG, compression 82.
- Output size follows source orientation.
- Outputs uploaded privately; browser receives signed URLs, not base64.

OpenAI’s Image API supports editing, multiple outputs, and configurable output properties. Complex generations may take up to two minutes, so the progress UI and Vercel duration are required. See [OpenAI Image Generation](https://developers.openai.com/api/docs/guides/image-generation) and [Images API reference](https://developers.openai.com/api/reference/resources/images).

### FR-04 — visual preservation prompt

```text
Edit the provided room photo into a photorealistic renovation concept.

Preserve the camera viewpoint, perspective, room proportions, walls, ceiling,
doors, windows, and permanent architectural elements unless the user explicitly
asks to change one. Keep the room recognizable. Do not add people, labels,
measurements, watermarks, or explanatory text.

Requested changes:
{instruction}

Apply only changes that support the request. Use plausible materials, scale,
lighting, and shadows. This is a visual concept, not a claim of technical or
structural feasibility.
```

### FR-05 — selection and refinement

- One current selection per project.
- Selected generated image becomes refinement source.
- Refinement instruction is a 10–800-character delta.
- Same generation endpoint supports initial and refinement.
- Default maximum three total generations per project.
- Previous stable generations remain available after failure.

### FR-06 — structured scope extraction

Use Responses API Structured Outputs to map written instruction history into a closed taxonomy. The model may suggest question IDs and ecological alternative IDs, but it may not invent quantities, prices, savings, certifications, or impact metrics.

OpenAI Structured Outputs enforces a supplied JSON Schema and supports explicit refusal handling. See [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

### FR-07 — deterministic questions

- Model suggestions are validated against a question catalogue.
- Rule engine decides whether a question is actually needed.
- Maximum three questions.
- Answers become authoritative project inputs.
- Default assumptions remain visible.

### FR-08 — dual estimate

- Both profiles use identical confirmed scope and quantities.
- Only supported material/method choices differ.
- All calculations are pure TypeScript functions.
- Same inputs and dataset version produce the same results.
- Missing items are excluded with an explanation, never zero-priced.
- Results include low/expected/high and direct/labor/material breakdown.

### FR-09 — ecological education

- Every ecological option references a curated catalogue record.
- Each record has rationale, trade-off, qualitative impact categories, and verification note.
- The model cannot add a new ecological claim at runtime.
- No numerical environmental claim without a documented calculation source.
- Suggestions are user-controlled and dismissible.

### FR-10 — marketplace post

- Generated from project, selected visual, scope, and estimate.
- User can edit title/note and choose timing/preference.
- Exact address is never included.
- Publish action stores `marketplace_demo_published` status or equivalent local state.
- Success page labels profiles/proposals as demonstrative.

### FR-11 — error behavior

- Retry transient network/429/5xx failures at most twice when route time remains.
- Do not retry invalid input or moderation blocks automatically.
- Preserve the latest stable state.
- Show Portuguese recovery actions.
- Never expose provider stack traces or secrets.

## 12. Scope taxonomy and questions

### 12.1 Supported priced categories

| Code | Work | Unit | Quantity basis |
| --- | --- | --- | --- |
| `wall_painting` | Pintura de paredes | m² | Floor area × 2.8 |
| `ceiling_painting` | Pintura de teto | m² | Floor area |
| `floor_removal` | Remoção de piso | m² | Floor area |
| `floor_installation` | Instalação de piso | m² | Floor area × 1.10 |
| `floor_restoration` | Restauração de piso | m² | Floor area; inspection required |
| `baseboard_installation` | Instalação de rodapé | linear m | Proxy; confirmation required |
| `lighting_point` | Ponto de iluminação | unit | User count |
| `electrical_point` | Ponto elétrico | unit | User count |
| `drywall_partition` | Parede drywall | m² | User quantity only |
| `demolition_light` | Demolição leve | m² | User/affected area |
| `debris_removal` | Retirada de entulho | service | Derived; confirmation required |
| `site_protection_cleaning` | Proteção e limpeza | service | One per project |

### 12.2 Unsupported or specialist categories

- Custom cabinetry.
- Loose furniture/appliances.
- Stonework.
- Plumbing relocation.
- Structural changes.
- Window replacement.
- Gas, HVAC, waterproofing, major electrical upgrade.

These appear in the marketplace brief but outside the automatic estimate unless a documented allowance exists.

### 12.3 Question catalogue

| Question ID | Trigger | Input |
| --- | --- | --- |
| `paint_ceiling` | Wall painting requested | Yes/no |
| `lighting_count` | Lighting change requested | Integer 1–20 |
| `electrical_count` | Electrical points requested | Integer 1–30 |
| `remove_existing_floor` | New floor requested | Remove / install over / unsure |
| `restore_floor_possible` | Existing floor visible/requested | Restore / replace / compare |
| `drywall_area` | Drywall requested | m² |
| `demolition_area` | Demolition requested | m² |

Ask only the highest-value three.

## 13. Dual-estimate and ecological methodology

### 13.1 Cost data

Use a committed, versioned snapshot based on official Brazilian construction references:

- [CAIXA SINAPI](https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx)
- [IBGE SINAPI](https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9270-sistema-nacional-de-pesquisa-de-custos-e-indices-da-construcao-civil.html)

P0 uses:

- São Paulo base line-item catalogue.
- One reference month.
- 27-UF aggregate index table for regional scaling.
- City displayed as context; price adjustment occurs at UF level.

Required metadata:

- Dataset version/reference month.
- Source URL/date.
- Unit and composition ID where available.
- Labor/material split.
- Transformation notes.

### 13.2 Estimate profiles

```ts
type EstimateProfile = 'economic' | 'ecological';
```

Both profiles share:

- Scope.
- Quantities.
- Regional factor.
- Labor unless method changes.
- Contingency.
- BDI/overhead.

They differ only through catalogue choice IDs.

### 13.3 Calculation

```text
regionalFactor = selectedUfIndex / baseSpIndex

materialUnit = baseMaterialUnit × regionalFactor × finishMultiplier
laborUnit    = baseLaborUnit × regionalFactor
lineDirect   = quantity × (materialUnit + laborUnit)

directCost = sum(lineDirect)
contingency = directCost × 0.10
subtotal = directCost + contingency
overheadBdi = subtotal × 0.15
expected = subtotal + overheadBdi
```

Round final totals to the nearest R$100.

Uncertainty:

- Base low/high: -10% / +15%.
- Add to upper bound for proxy quantities and specialist exclusions.
- Maximum displayed upper uncertainty: +35%.

### 13.4 Ecological alternative catalogue

P0 alternatives should be few, strong, and relevant:

| Alternative | Economic baseline | Ecological option | Impact categories | Caveat |
| --- | --- | --- | --- | --- |
| Existing floor | Remove and replace | Restore/refinish when viable | Waste, materials | Requires inspection |
| Paint | Standard supported paint allowance | Low-emission/water-based verified product allowance | Indoor environment, materials | Confirm product data/certification |
| Lighting | Basic replacement | Efficient LED solution | Operational energy | Savings depend on use |
| Fixtures when requested | Standard fixture | Water-efficient fixture | Water | Confirm flow rating and compatibility |
| New wood material | Standard allowance | Verified certified/reclaimed alternative | Materials | Supplier documentation required |
| Demolition | Full replacement method | Selective removal/reuse plan | Waste | Labor may increase |

Construction-waste reduction and energy-efficient buildings are recognized policy/technical priorities. Use [CONAMA Resolution 307](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=305) and [PROCEL Edifica](https://www.gov.br/mme/pt-br/assuntos/secretarias/sntep/procel/procel-edifica) as background references. The MVP still uses qualitative, project-specific language rather than unsupported outcome numbers.

### 13.5 Ecological record contract

```ts
type EcoAlternative = {
  id: string;
  scopeCategory: ScopeCategory;
  economicChoiceId: string;
  ecologicalChoiceId: string;
  labelPtBr: string;
  rationalePtBr: string;
  tradeoffPtBr: string;
  impactCategories: Array<
    'waste' | 'materials' | 'energy' | 'water' | 'indoor_environment'
  >;
  verificationNotePtBr: string;
  sourceNote: string;
};
```

### 13.6 Anti-greenwashing rules

- Never say `sustainable` as an absolute product guarantee.
- Prefer `opção com menor impacto potencial` or a specific property.
- Never claim exact carbon reduction in P0.
- Never claim energy/water savings without rated product and usage inputs.
- Certifications must be verified by the contractor/supplier.
- An ecological alternative can be cheaper or more expensive; do not force a premium.
- Reuse is suggested only when condition/technical viability is confirmed.

## 14. Marketplace prototype specification

### 14.1 Project-post object

```ts
type MarketplaceProjectPost = {
  id: string;
  projectId: string;
  title: string;
  city: string;
  uf: string;
  roomType: RoomType;
  areaM2: number;
  coverVariantId: string;
  includeOriginalImage: boolean;
  confirmedScope: ConfirmedScopeItem[];
  estimatePreference: 'economic' | 'ecological' | 'both';
  economicRange: MoneyRange;
  ecologicalRange: MoneyRange;
  sustainabilityPreferences: string[];
  desiredStart: 'urgent' | 'within_30_days' | 'one_to_three_months' | 'researching';
  datesFlexible: boolean;
  allowEquivalentAlternatives: boolean;
  note?: string;
  status: 'draft' | 'marketplace_demo_published';
};
```

### 14.2 Seeded marketplace data

Static TypeScript/JSON only:

```text
src/data/marketplace/professionals.ts
src/data/marketplace/proposals.ts
```

Every record contains `isDemo: true` and the UI displays a demonstration badge.

### 14.3 Marketplace screens

P0 routes:

```text
/projeto/[id]/publicar
/marketplace
/marketplace/pedido/[id]
```

P0 interactions:

- Preview/edit post.
- Toggle original image visibility.
- Choose estimate preference.
- Publish success state.
- Browse sample cards.
- Open one sample proposal drawer if time permits.

No action may imply that a real contractor was contacted.

## 15. Technical architecture

### 15.1 Stack

| Layer | Choice |
| --- | --- |
| App | Next.js App Router + TypeScript |
| UI | Tailwind + small Radix/shadcn-style primitive set |
| Validation | Zod |
| Image edits | OpenAI Images Edit API |
| Structured extraction | OpenAI Responses API Structured Outputs |
| Database | Supabase Postgres |
| Media | Private Supabase Storage |
| Hosting | Vercel Node.js functions |
| Tests | Vitest; Testing Library; one Playwright smoke test if time |

### 15.2 Request topology

```text
Browser
  ├─ create anonymous project
  ├─ get signed upload URL
  ├─ upload normalized photo ────────────────────> Supabase Storage
  ├─ create generation
  │    ├─ load private source
  │    ├─ OpenAI images.edit(n=4)
  │    ├─ store outputs ─────────────────────────> Supabase Storage
  │    └─ persist lineage ───────────────────────> Supabase Postgres
  ├─ select/refine variant
  ├─ extract scope/questions ────────────────────> OpenAI Responses
  ├─ confirm scope
  ├─ calculate two profiles ─────────────────────> deterministic engine
  └─ publish marketplace demo post ──────────────> Supabase Postgres
```

### 15.3 Long-running route

```ts
export const runtime = 'nodejs';
export const maxDuration = 300;
```

Current Vercel Hobby Node.js functions support a 300-second maximum. Target image completion under 180 seconds. See [Vercel function limits](https://vercel.com/docs/functions/limitations).

### 15.4 Repository structure

```text
src/
  app/
    api/
      projects/
      uploads/sign/
      generations/
      scope/
      estimates/
      marketplace/publish/
    projeto/[id]/
    marketplace/
  components/
    ui/
    creation/
    generation/
    scope/
    estimates/
    marketplace/
  data/
    costs/
    eco/
    marketplace/
  lib/
    ai/
    estimate/
    eco/
    storage/
    supabase/
    auth/
  types/
supabase/migrations/
tests/
docs/
```

### 15.5 Environment variables

```text
OPENAI_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_SCOPE_MODEL=gpt-5.6
OPENAI_IMAGE_QUALITY=medium
OPENAI_IMAGE_FORMAT=jpeg
OPENAI_IMAGE_COMPRESSION=82

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SESSION_SIGNING_SECRET=
MAX_GENERATIONS_PER_PROJECT=3
GENERATION_ENABLED=true
MARKETPLACE_MODE=demo
```

## 16. Data model

### 16.1 Projects

```text
projects
  id uuid PK
  session_hash text
  status text
  city text
  uf char(2)
  room_type text
  area_m2 numeric
  finish_tier text
  original_instruction text
  original_storage_path text nullable
  selected_variant_id uuid nullable
  generation_count int
  created_at timestamptz
  updated_at timestamptz
```

### 16.2 Generations and variants

```text
generations
  id uuid PK
  project_id uuid FK
  parent_variant_id uuid nullable
  kind text
  instruction text
  compiled_prompt text
  status text
  provider_request_id text nullable
  duration_ms int nullable
  error_code text nullable
  created_at timestamptz

variants
  id uuid PK
  generation_id uuid FK
  ordinal int
  storage_path text
  mime_type text
  created_at timestamptz
```

### 16.3 Scope and estimates

```text
estimates
  id uuid PK
  project_id uuid FK
  dataset_version text
  scope_json jsonb
  economic_result_json jsonb
  ecological_result_json jsonb
  preferred_profile text nullable
  created_at timestamptz
```

### 16.4 Marketplace post

```text
marketplace_posts
  id uuid PK
  project_id uuid FK unique
  status text
  post_json jsonb
  created_at timestamptz
  updated_at timestamptz
```

There are no contractor/proposal tables in P0. Those records are static demo data.

## 17. API contracts

### 17.1 Common response

```ts
type ApiEnvelope<T> =
  | { ok: true; data: T; requestId: string }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable: boolean;
        field?: string;
      };
      requestId: string;
    };
```

### 17.2 Endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/projects` | Create project and anonymous session |
| `POST /api/uploads/sign` | Reserve private source path and return signed upload |
| `POST /api/generations` | Initial or refinement generation |
| `POST /api/generations/:id/select` | Persist selected variant |
| `POST /api/scope` | Extract controlled scope and possible question IDs |
| `POST /api/estimates` | Calculate both deterministic profiles |
| `GET /api/projects/:id` | Restore project and refresh signed URLs |
| `POST /api/marketplace/publish` | Persist UI-only project post status/payload |

### 17.3 Generation request

```ts
type CreateGenerationRequest = {
  projectId: string;
  parentVariantId?: string;
  instruction?: string;
};
```

Initial generation reads the original path/instruction from the project. Refinement requires a parent variant and delta instruction. The client cannot choose source paths, model parameters, or output count.

### 17.4 Estimate response

```ts
type DualEstimateResponse = {
  datasetVersion: string;
  referencePeriod: string;
  regionalReference: { uf: string };
  economic: EstimateResult;
  ecological: EstimateResult;
  comparisons: Array<{
    scopeCategory: ScopeCategory;
    economicChoice: string;
    ecologicalChoice: string;
    upfrontDifference: number;
    rationale: string;
    tradeoff: string;
    impactCategories: string[];
    verificationNote: string;
  }>;
  sharedAssumptions: string[];
  exclusions: string[];
};
```

## 18. Security, privacy, and safety

- OpenAI key, Supabase service role, and signing secret are server-only.
- Private Storage bucket; signed URLs only.
- Browser upload path is server-generated.
- Validate MIME signature, size, dimensions, prompt length, and project ownership.
- Strip EXIF/GPS through re-encoding.
- Never expose exact address in marketplace.
- Ask consent before showing images in the marketplace prototype.
- Demo contractor records are fictional and labeled.
- Do not log image bytes, signed URLs, cookies, or secret values.
- Do not automatically retry moderation-blocked requests.
- Structural, plumbing, electrical, gas, and code-related requests carry professional-review warnings.
- Anonymous media retention target: 24 hours; document manual cleanup if automation is cut.

Stable errors:

```text
INVALID_IMAGE
UPLOAD_FAILED
PROJECT_FORBIDDEN
GENERATION_LIMIT_REACHED
GENERATION_ALREADY_RUNNING
OPENAI_AUTH_FAILED
OPENAI_QUOTA_EXCEEDED
OPENAI_RATE_LIMITED
OPENAI_MODERATION_BLOCKED
OPENAI_TIMEOUT
OPENAI_SERVER_ERROR
OUTPUT_STORAGE_FAILED
SCOPE_PARSE_FAILED
COST_DATA_MISSING
ESTIMATE_VALIDATION_FAILED
MARKETPLACE_POST_FAILED
INTERNAL_ERROR
```

## 19. Testing and definition of done

### 19.1 Unit tests

- Prompt compiler preservation contract.
- Scope schema rejects unknown categories.
- Question selection returns maximum three.
- Quantity formulas.
- Regional scaling.
- Finish multiplier affects material only unless specified.
- Economic/ecological profiles share scope and quantities.
- Every ecological substitution exists in catalogue.
- Missing eco option falls back to economic item with visible note.
- Contingency, BDI, uncertainty, and rounding.
- Marketplace post omits exact address/private fields.

### 19.2 Integration tests

- Create → upload → four outputs → selection.
- Selection → refinement from selected private path.
- Scope extraction → questions → confirmation.
- Confirmed scope → both estimates.
- Estimate preference → marketplace post.
- Model refusal → manual scope fallback.
- Generation failure preserves latest successful candidates.

### 19.3 Manual acceptance

- [ ] Complete flow works on 390 px mobile and desktop.
- [ ] Four live outputs return from a real photo.
- [ ] Refinement uses selected result.
- [ ] No price comes from model output.
- [ ] Both estimate cards explain their differences.
- [ ] Eco claims are qualitative and catalogue-backed.
- [ ] Marketplace post is prefilled.
- [ ] All sample profiles say `Perfil demonstrativo`.
- [ ] Public URL works in incognito.
- [ ] No secrets in repository or client bundle.
- [ ] README and build log identify original event work.

## 20. Three-person delivery model

### 20.1 Recommended split

#### Person 1 — Creation Experience and Integration

**Mission:** Own the coherent user journey and final integration.

**Owns:**

```text
src/app/page.tsx
src/app/projeto/**
src/components/ui/**
src/components/creation/**
src/components/generation/**
src/app/globals.css
src/types/**
package.json
deployment/config integration
```

**Builds:**

- Design tokens and primitives.
- Intake/photo UI.
- Generation progress.
- Four-option gallery.
- Selection/refinement interface.
- Shared project state and API integration.
- Responsive/accessibility pass.
- Final Vercel deployment.

**Role:** Lead integrator. Approves shared schema/dependency changes.

#### Person 2 — AI, Media, and Structured Questions

**Mission:** Make the expensive/risky intelligence path reliable.

**Owns:**

```text
src/lib/ai/**
src/lib/storage/**
src/lib/auth/**
src/lib/supabase/**
src/app/api/projects/**
src/app/api/uploads/**
src/app/api/generations/**
src/app/api/scope/**
supabase/migrations/**
tests/ai/**
```

**Builds:**

- Anonymous project/session.
- Signed uploads and private media.
- OpenAI image edits with four outputs.
- Refinement lineage.
- Preservation prompt.
- Structured scope extraction.
- Validated question suggestions.
- Provider error mapping/retries.

**Does not build:** Marketplace UI or price formulas.

#### Person 3 — Dual Estimate and Marketplace Handoff

**Mission:** Turn the approved concept into the differentiated business artifact.

**Owns:**

```text
src/lib/estimate/**
src/lib/eco/**
src/data/costs/**
src/data/eco/**
src/data/marketplace/**
src/app/api/estimates/**
src/app/api/marketplace/**
src/components/scope/**
src/components/estimates/**
src/components/marketplace/**
src/app/marketplace/**
tests/estimate/**
docs/DATA_SOURCES.md
```

**Builds:**

- Question-rule catalogue and scope confirmation UI.
- SINAPI snapshot/schema.
- Economic calculator.
- Ecological alternatives catalogue.
- Dual comparison UI.
- Marketplace post preview/publish state.
- Seeded professional/proposal cards.

**Does not build:** Image generation or shared project scaffolding.

### 20.2 Why this is better than “user flow / engine / marketplace”

- The user-flow person would otherwise own most of the application.
- A UI-only marketplace is not enough work for a full third.
- Pairing the marketplace with dual estimates creates a complete handoff vertical.
- Pairing questions with AI/media keeps all interpretation contracts with one owner.
- One integrator prevents shared-state and visual inconsistencies.

### 20.3 Collaboration rules

- Person 1 creates shared types before parallel coding.
- One owner per file path.
- Only Person 1 changes dependencies after kickoff.
- Only Person 2 runs/changes migrations after initial agreement.
- Agents report changed files, tests, and blockers.
- Integrate every 45–60 minutes; do not wait for one final merge.
- Freeze schema at T+2 hours unless a blocker requires change.
- Freeze features at T+4 hours.
- Coding agents may assist each person, but each workstream has one human decision owner.

## 21. Six-hour execution plan

### 00:00–00:20 — hard technical gates

- Initialize git and baseline commit.
- Verify OpenAI organization/model access.
- Run one real image edit and `n=4` test.
- Confirm Supabase/Vercel credentials.
- Choose owned/licensed demo photo.

If four-output editing does not work by T+20, solve it before UI polish.

### 00:20–00:45 — shared foundation

- Scaffold Next.js/TypeScript.
- Add shared domain types and Zod schemas.
- Add `.env.example`, scripts, lockfile.
- Create Supabase migration/private bucket.
- Deploy blank app to Vercel.
- Commit.

### 00:45–02:15 — parallel build 1

**Person 1:** Intake, progress, gallery, refinement UI using typed mocks.  
**Person 2:** Project/upload/generation/scope routes and live image spike.  
**Person 3:** Cost/eco datasets, calculators, scope/estimate/marketplace UI using typed mocks.

### 02:15–03:00 — vertical integration

- Real upload → four images → gallery.
- Persist/select candidate.
- Refinement from selected image.
- Deploy and smoke-test.

Hard gate at T+3: the visual flow must work in production.

### 03:00–04:00 — differentiated ending

- Scope extraction/questions → confirmation.
- Both deterministic estimates.
- Estimate comparison and preference.
- Marketplace post preview and demo publish.
- Seeded marketplace feed.

Hard gate at T+4: the full mocked-data fallback and primary live flow must both reach the end.

### 04:00–04:45 — hardening

- Mobile/accessibility.
- Error/retry states.
- No-secret check.
- Unit/integration tests.
- Eco-copy review for unsupported claims.
- Marketplace demo labels.

### 04:45–05:15 — production freeze

- Final deployment.
- One complete live smoke test.
- Confirm incognito access.
- Confirm private media and logs.
- Freeze dependencies/schema/features.

### 05:15–06:00 — submission

- README/build log/data sources.
- One-minute video.
- Three-minute live demo rehearsal twice.
- Q&A preparation.
- Public repository and submission checks.

## 22. Demo plan

### 22.1 Three-minute live demo

**0:00–0:20 — problem**

> “Renovation starts with an image in the client’s head, but the contractor receives an ambiguous message and an unknown budget.”

**0:20–0:40 — input and live generation**

- Load sample room.
- Show location/area/request.
- Trigger four outputs immediately.

**0:40–1:15 — explain during wait**

- Explain user choice, no pixel measurement, transparent estimates.
- Mention that scope becomes contractor-ready.

**1:15–1:50 — select and refine**

- Compare four.
- Select one.
- Show one previously completed refinement from the same project if a second live call would exceed time.

**1:50–2:30 — dual estimate**

- Show three questions and confirmed scope.
- Compare economic and ecological cards.
- Expand one ecological trade-off.

**2:30–2:55 — marketplace**

- Select `receber propostas para as duas`.
- Show prefilled post.
- Publish to prototype.
- Show demonstration contractor cards.

**2:55–3:00 — close**

> “Obra Clara turns a photo into a choice, a transparent plan, and a project professionals can act on.”

### 22.2 One-minute video

- 0–8s: problem.
- 8–20s: photo and four concepts.
- 20–30s: selection/refinement.
- 30–45s: economic vs ecological comparison.
- 45–55s: prefilled marketplace post.
- 55–60s: architecture/value statement.

Use cuts for model wait time and label the cut honestly.

## 23. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Marketplace dilutes core story | High | Treat it only as final handoff; maximum 20 seconds in demo |
| Ecological estimate becomes greenwashing | Critical | Curated catalogue, qualitative claims, verification notes, no CO₂ numbers |
| Two estimates double complexity | Medium | Same scope/formula; only choice IDs differ |
| One person is overloaded with frontend | High | Person 3 owns estimate/marketplace UI; Person 1 owns creation UI only |
| Marketplace owner waits for upstream data | Medium | Typed fixtures and agreed post schema at kickoff |
| Four-image latency threatens demo | High | Test first, progress UX, saved real project, medium/low quality fallback |
| Estimate looks definitive | High | Ranges, assumptions, UF-level reference, mandatory disclaimer |
| Generic image-app perception | High | Demonstrate scope, dual trade-offs, and contractor-ready post |
| “Image analyzer” prohibition | Critical | No image measurements or analysis framing |
| Static profiles appear real | High | Fictional data and visible `Perfil demonstrativo` badges |
| Schema conflicts across three people | High | Shared types first, file ownership, Person 1 integration authority |

## 24. Final definition of done

The MVP is done when a judge can watch one project move from a real photo to a marketplace-ready brief without explanation filling in missing functionality.

- [ ] Real photo upload.
- [ ] Four live concepts.
- [ ] User selection.
- [ ] One working refinement path.
- [ ] Maximum three useful questions.
- [ ] Confirmed scope.
- [ ] Economic estimate.
- [ ] Ecological estimate with at least three catalogue-backed alternatives.
- [ ] Transparent comparison and preferred-plan selection.
- [ ] Prefilled marketplace post.
- [ ] Demo publish success.
- [ ] Fictional marketplace cards labeled demonstrative.
- [ ] Mobile and desktop flow.
- [ ] Public Vercel URL.
- [ ] Public repository with no secrets.
- [ ] README, build log, data sources, and demo script.

## 25. References

- [OpenAI Image Generation](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI Images API reference](https://developers.openai.com/api/reference/resources/images)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Vercel Function limits](https://vercel.com/docs/functions/limitations)
- [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [CAIXA SINAPI](https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx)
- [IBGE SINAPI](https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9270-sistema-nacional-de-pesquisa-de-custos-e-indices-da-construcao-civil.html)
- [CONAMA Resolution 307](https://conama.mma.gov.br/?option=com_sisconama&task=arquivo.download&id=305)
- [PROCEL Edifica](https://www.gov.br/mme/pt-br/assuntos/secretarias/sntep/procel/procel-edifica)

