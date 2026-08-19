"use client";
import { useEffect, useMemo, useState } from "react";

type Demo = any;
const money = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const quantity = (milli: number, unit: string) => `${(milli / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}`;

export default function DemoPage() {
  const [role, setRole] = useState<"CLIENT" | "SUPPLIER">("CLIENT");
  const [data, setData] = useState<Demo | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("Demo determinística com resultados previamente gerados por APIs reais.");
  async function load(nextRole = role) { const response = await fetch("/api/demo", { headers: { "x-obria-role": nextRole }, cache: "no-store" }); if (response.ok) setData(await response.json()); }
  async function action(path: string, body?: unknown, nextRole = role, method = "POST") { setBusy(path); setMessage("Processando no domínio Obria…"); const response = await fetch(path, { method, headers: { "content-type": "application/json", "x-obria-role": nextRole }, body: body === undefined ? undefined : JSON.stringify(body) }); const result = await response.json(); setBusy(""); if (!response.ok) { setMessage(result.error?.message ?? "A ação não pôde ser concluída."); return; } setMessage("Atualizado. O estado foi persistido e pode ser conferido após refresh."); await load(nextRole); }
  useEffect(() => { void load(); }, [role]);
  const latest = useMemo(() => data?.versions?.at(-1), [data]);
  const approved = data?.versions?.find((version: Demo) => version.state === "APPROVED");
  const phase = data?.project?.state ?? "DRAFT";
  const phaseIndex = ({ DESIGN_READY: 0, PLAN_APPROVED: 1, READY_TO_SHARE: 2, OPEN_FOR_QUOTES: 2, AWAITING_ACCEPTANCE: 3, ACCEPTED: 4 } as Record<string, number>)[phase] ?? -1;
  if (!data) return <main className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">O</span> obria</div><span className="mono">carregando sala…</span></header></main>;
  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">O</span> obria</div><div className="status"><span className="status-dot" /> Storage · dados · MCP <strong>OK</strong></div></header>
    <section className="hero"><div><div className="eyebrow mono">prancheta de obra contemporânea / 001</div><h1>Do primeiro clique à sala pronta.</h1><p>Uma foto vira decisão mensurável: versão visual, quantitativos, pesquisa de produtos e uma proposta de mão de obra que chega com contexto.</p><div className="actions"><a className="btn" href="#workspace">Abrir sala demo</a><a className="btn secondary" href="#proof">Ver o que é real</a></div></div><aside className="hero-note"><strong>Uma sala. Dois papéis. Zero botão cenográfico.</strong><span className="muted">O cliente mantém a autoria do plano. O fornecedor recebe somente o briefing publicável.</span></aside></section>
    <section className="workspace" id="workspace"><div className="role-switch" aria-label="Selecionar papel"><button className={role === "CLIENT" ? "active" : ""} onClick={() => setRole("CLIENT")}>Cliente</button><button className={role === "SUPPLIER" ? "active" : ""} onClick={() => setRole("SUPPLIER")}>Fornecedor</button></div>
      {role === "CLIENT" ? <ClientView data={data} phaseIndex={phaseIndex} latest={latest} approved={approved} busy={busy} message={message} action={action} /> : <SupplierView data={data} busy={busy} message={message} action={action} />}
    </section>
    <footer className="footer" id="proof"><span className="mono">OBRIA / MVP HACKATHON</span><span>Replay fixo: São Paulo · 4,0 × 3,0 × 2,7 m · relógio 19 ago 2026</span></footer>
  </main>;
}

function ClientView({ data, phaseIndex, latest, approved, busy, message, action }: Demo) {
  const project = data.project;
  const report = data.productResearch;
  const selections = report?.results?.map((result: Demo) => {
    const path = result.paths.find((candidate: Demo) =>
      candidate.kind === "LOWEST_UPFRONT" &&
      (candidate.status === "AVAILABLE" || candidate.status === "AVAILABLE_WITH_VERIFICATION")
    );
    return path ? { needId: result.need.id, path: path.kind } : null;
  }).filter(Boolean) ?? [];
  const canIterate = project.state === "DESIGN_READY" || project.state === "DESIGN_ERROR";
  const canApprove = latest?.state === "READY" && project.state === "DESIGN_READY";
  const canResearch = project.state === "PLAN_APPROVED" && !report;
  const canSelect = project.state === "PLAN_APPROVED" && report && selections.length === report.results.length && !data.productSelections?.length;
  const canPublish = project.state === "READY_TO_SHARE";
  const canAccept = project.state === "AWAITING_ACCEPTANCE" && data.proposals?.length;
  const version = approved ?? latest;

  return <>
    <div className="steps">{["Briefing", "Iterações", "Aprovação", "Marketplace", "Aceite"].map((label: string, index: number) => <div className={`step ${index < phaseIndex + 1 ? "done" : ""} ${index === phaseIndex + 1 ? "current" : ""}`} key={label}>{String(index + 1).padStart(2, "0")} · {label}</div>)}</div>
    <div className="grid">
      <div className="panel">
        <div className="room-image"><img src={version?.imageDataUri} alt="Visualização da sala demo" /><span className="image-tag mono">{approved ? "versão aprovada" : `versão ${latest?.number}`}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, marginTop: 18 }}><div><div className="mono muted">projeto</div><h2>{project.title}</h2></div><div className="mono">{project.state}</div></div>
        <p>{latest?.summary}</p>
        <div className="chips">{latest?.plan?.interventions?.map((item: Demo) => <span className="chip" key={item.catalogKey}>{item.catalogKey.replaceAll("_", " ")}</span>)}</div>
        <div className="actions">
          <button className="btn" disabled={!canIterate || !!busy} onClick={() => action(`/api/projects/${project.id}/designs`, { prompt: "menos marcenaria, mais plantas" })}>{busy.includes("designs") ? "Gerando…" : "Iterar com MCP"}</button>
          <button className="btn secondary" disabled={!canApprove || !!busy} onClick={() => action(`/api/projects/${project.id}/approve`, { versionId: latest.id, expectedRevision: project.revision })}>Aprovar versão {latest?.number}</button>
          {canResearch && <button className="btn secondary" disabled={!!busy} onClick={() => action(`/api/projects/${project.id}/product-research`, { expectedRevision: project.revision })}>Pesquisar produtos</button>}
          {report && !data.productSelections?.length && <button className="btn secondary" disabled={!canSelect || !!busy} onClick={() => action(`/api/projects/${project.id}/product-research`, { expectedRevision: project.revision, selections }, "CLIENT", "PATCH")}>Selecionar menores preços</button>}
          <button className="btn secondary" disabled={!canPublish || !!busy} onClick={() => action(`/api/projects/${project.id}/publish`)}>Publicar para cotação</button>
          {approved && <button className="btn secondary" disabled={!!busy} onClick={() => action(`/api/projects/${project.id}/world`)}>Abrir 3D real</button>}
          {canAccept && <button className="btn" disabled={!!busy} onClick={() => action(`/api/proposals/${data.proposals[0].id}/accept`)}>Aceitar proposta</button>}
        </div>
        <div className={`notice ${project.state === "ACCEPTED" ? "success" : ""}`} role="status">{message}</div>
      </div>
      <aside className="panel dark">
        <div className="mono">briefing mensurável</div>
        <h2>O que não se perde no caminho.</h2>
        <div className="meta-row"><span className="meta-label">Dimensões</span><strong>{(project.brief.lengthMm / 1000).toFixed(1).replace(".", ",")} × {(project.brief.widthMm / 1000).toFixed(1).replace(".", ",")} × {(project.brief.heightMm / 1000).toFixed(1).replace(".", ",")} m</strong></div>
        <div className="meta-row"><span className="meta-label">Cidade</span><strong>{project.brief.city} / {project.brief.state}</strong></div>
        <div className="meta-row"><span className="meta-label">Orçamento</span><strong>{money(project.brief.budgetCents)}</strong></div>
        <div className="meta-row"><span className="meta-label">Preservar</span><strong>{project.brief.preserve.join(", ")}</strong></div>
        <div style={{ marginTop: 28 }}><div className="mono">análise com incerteza</div>{project.analysis.observed.map((item: string) => <p className="small" key={item}>+ {item}</p>)}<p className="small" style={{ color: "var(--coral)" }}>? {project.analysis.uncertainties[0]}</p></div>
      </aside>
    </div>
    <div className="grid" style={{ marginTop: 20 }}>
      <div className="panel">
        <div className="mono muted">histórico imutável</div>
        <h2>Versões que podem ser cotadas.</h2>
        <div className="version-list">{data.versions.map((item: Demo) => <div className={`version ${item.state === "APPROVED" ? "approved" : ""}`} key={item.id}><div><strong>V{item.number} · {item.state}</strong><div className="small muted">{item.summary}</div></div></div>)}</div>
      </div>
      <div className="panel">
        <div className="mono muted">{report ? report.sourceNoticePtBr : "quantitativos de execução"}</div>
        <h2>{report ? "Pesquisa para decidir." : "Escopo calculado."}</h2>
        {report ? report.results.map((result: Demo) => {
          const lowest = result.paths.find((path: Demo) => path.kind === "LOWEST_UPFRONT");
          return <div className="quote-line" key={result.need.id}><span>{result.need.label}<br /><small className="muted">{result.offers.length} ofertas · {lowest?.whatToVerifyPtBr?.[0] ?? "sem oferta compatível para selecionar"}</small></span><strong>{result.marketRangeCents ? `${money(result.marketRangeCents.low)}–${money(result.marketRangeCents.high)}` : "sem faixa"}</strong></div>;
        }) : version?.workQuantities?.map((line: Demo) => <div className="quote-line" key={line.catalogKey}><span>{line.referenceLabel}<br /><small className="muted">{line.referenceCode}</small></span><strong>{quantity(line.quantityMilli, line.unit)}</strong></div>)}
      </div>
    </div>
  </>;
}

function SupplierView({ data, busy, message, action }: Demo) {
  const opportunity = data.opportunity;
  const proposal = data.proposals?.[0];
  const lines = opportunity?.workQuantities?.map((item: Demo) => ({
    catalogKey: item.catalogKey,
    quantityMilli: item.quantityMilli,
    laborPriceCents: Math.max(25_000, Math.round(item.quantityMilli / 1000) * 5_000),
    note: "mão de obra e instalação",
  })) ?? [];

  return <div className="grid">
    <div className="panel dark">
      <div className="mono">folha técnica / oportunidade</div>
      <h2>{opportunity ? opportunity.title : "A demanda ainda está fechada."}</h2>
      {opportunity ? <>
        <div className="room-image"><img src={opportunity.imageDataUri} alt="Imagem aprovada compartilhada com fornecedor" /><span className="image-tag mono">briefing aprovado</span></div>
        <div className="meta-row"><span className="meta-label">Local</span><strong>{opportunity.city} / {opportunity.state}</strong></div>
        <div className="meta-row"><span className="meta-label">Prazo de resposta</span><strong>7 dias</strong></div>
        <div style={{ marginTop: 28 }}>
          <div className="mono">produtos escolhidos pelo cliente</div>
          {opportunity.selectedProducts.map((product: Demo) => <p className="small" key={product.needId}>+ {product.quantity} × {product.productName} · {product.shopName}</p>)}
        </div>
        <div className="actions"><button className="btn" disabled={!!proposal || !!busy} onClick={() => action(`/api/opportunities/${opportunity.id}/proposals`, { lines, freightCents: 18_000, taxCents: 72_000, leadDays: 18, validUntil: "2026-09-03T12:00:00.000Z", includes: ["mão de obra", "montagem", "proteção do piso"], excludes: ["materiais e produtos", "obra estrutural"] }, "SUPPLIER")}>{proposal ? "Proposta enviada" : "Revisar e enviar mão de obra"}</button></div>
      </> : <p>O cliente precisa aprovar, pesquisar os produtos e publicar o plano antes de a demanda aparecer aqui.</p>}
    </div>
    <aside className="panel">
      <div className="mono muted">proposta do fornecedor</div>
      <h2>{proposal ? proposal.state : "sem rascunho"}</h2>
      {proposal ? <>
        <div className="quote-total"><span>Mão de obra</span><strong>{money(proposal.laborSubtotalCents)}</strong></div>
        <div className="quote-total"><span>Total proposto</span><strong>{money(proposal.totalCents)}</strong></div>
        <div className="meta-row"><span className="meta-label">Entrega</span><strong>{proposal.leadDays} dias</strong></div>
        <p className="small">Inclui: {proposal.includes.join(", ")}</p>
        <p className="small">Exclui: {proposal.excludes.join(", ")}</p>
      </> : <p>O fornecedor informa somente mão de obra, frete, impostos e prazo. Os produtos já foram escolhidos pelo cliente.</p>}
      <div className={`notice ${proposal?.state === "ACCEPTED" ? "success" : ""}`} role="status">{message}</div>
    </aside>
  </div>;
}
