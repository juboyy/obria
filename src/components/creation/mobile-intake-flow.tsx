"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { projectFlowGateway, type GenerationVariant, type ProjectDraft } from "@/integrations/project-flow";
import type { FinishTier, RoomType } from "@/types";

type Step = "photo" | "location" | "room" | "area" | "finish" | "request" | "generating" | "gallery";

const rooms: Array<{ value: RoomType; label: string }> = [
  { value: "living_room", label: "Sala" },
  { value: "bedroom", label: "Quarto" },
  { value: "kitchen", label: "Cozinha" },
  { value: "bathroom", label: "Banheiro" },
  { value: "office", label: "Escritório" },
  { value: "other", label: "Outro" },
];
const finishes: Array<{ value: FinishTier; label: string }> = [
  { value: "economy", label: "Econômico" },
  { value: "standard", label: "Padrão" },
  { value: "premium", label: "Premium" },
];
const stepNumber: Record<Exclude<Step, "photo" | "generating" | "gallery">, number> = {
  location: 1,
  room: 2,
  area: 3,
  finish: 4,
  request: 5,
};

export function MobileIntakeFlow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [area, setArea] = useState("");
  const [finishTier, setFinishTier] = useState<FinishTier | null>(null);
  const [request, setRequest] = useState("");
  const [variants, setVariants] = useState<GenerationVariant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const roomLabel = rooms.find((room) => room.value === roomType)?.label;
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];
  const answers = useMemo(() => [
    location,
    roomLabel,
    area ? `${area} m²` : "",
    finishes.find((finish) => finish.value === finishTier)?.label,
  ].filter(Boolean), [area, finishTier, location, roomLabel]);

  function choosePhoto(file?: File) {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Escolha uma foto JPG, PNG ou WebP.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function generate() {
    if (!photo || !location || !roomType || !finishTier || !Number(area) || request.trim().length < 10) return;
    const draft: ProjectDraft = {
      location: { source: "manual", label: location },
      roomType,
      roomLabel: roomLabel ?? "Ambiente",
      areaM2: Number(area.replace(",", ".")),
      finishTier,
      instruction: request.trim(),
    };
    setStep("generating");
    setError("");
    try {
      const result = await projectFlowGateway.generateProject({ ...draft, originalImage: photo });
      setVariants(result.variants);
      setSelectedId(result.variants[0]?.id ?? "");
      setStep("gallery");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível criar as propostas.");
      setStep("request");
    }
  }

  if (step === "photo") {
    return (
      <main className="camera-shell">
        <section className="camera-viewfinder">
          {previewUrl ? <img className="camera-preview" src={previewUrl} alt="Foto escolhida do ambiente" /> : <div className="camera-fallback" aria-hidden="true" />}
          <div className="camera-shade" aria-hidden="true" />
          <header className="camera-header"><span className="camera-brand"><i aria-hidden="true">◒</i> ObrIA</span></header>
          <div className="camera-framing-copy">
            <strong>{previewUrl ? "Esta foto mostra bem o espaço?" : "Comece com uma foto do ambiente"}</strong>
            <p>{previewUrl ? "Você poderá trocar a foto antes de gerar." : "Inclua piso, paredes e janelas no enquadramento."}</p>
          </div>
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => choosePhoto(event.target.files?.[0])} />
          {previewUrl ? (
            <div className="camera-confirmation"><Button variant="secondary" onClick={() => inputRef.current?.click()}>Trocar foto</Button><Button onClick={() => setStep("location")}>Usar esta foto</Button></div>
          ) : (
            <div className="camera-controls"><button className="album-control" type="button" onClick={() => inputRef.current?.click()}><span aria-hidden="true" /><small>Escolher foto</small></button><button className="shutter-control" type="button" onClick={() => inputRef.current?.click()} aria-label="Abrir câmera"><span /></button><span className="flip-control" aria-hidden="true"><span>✦</span><small>IA visual</small></span></div>
          )}
        </section>
        {error ? <p className="field__error" role="alert">{error}</p> : null}
      </main>
    );
  }

  if (step === "generating") {
    return (
      <main className="chat-shell"><header className="chat-header"><span className="flow-brand"><i>◒</i> ObrIA</span><span>Agente visual</span></header><section className="generating-screen" aria-live="polite"><div className="generating-copy"><p className="flow-kicker">Criando</p><h1>Quatro caminhos para o seu espaço.</h1><p>A IA está preservando a estrutura e explorando materiais, luz e atmosfera.</p></div><div className="generation-grid">{["A", "B", "C", "D"].map((label) => <div className="generation-skeleton" key={label}><span>{label}</span><i /></div>)}</div><div className="generation-status"><span className="button__spinner" aria-hidden="true" /><p>Gerando suas propostas…</p></div><small>Isso costuma levar menos de um minuto.</small></section></main>
    );
  }

  if (step === "gallery") {
    return (
      <main className="chat-shell"><header className="chat-header"><span className="flow-brand"><i>◒</i> ObrIA</span><span>4 propostas</span></header><section className="flow-content"><p className="flow-kicker">Resultado</p><h1>Qual caminho parece mais com você?</h1><p className="flow-copy">Escolha uma proposta ou compare com a foto original.</p><button className="compare-action" type="button" onClick={() => setShowOriginal(true)}><span aria-hidden="true">◐</span> Comparar com original</button><div className="concept-list" role="radiogroup" aria-label="Propostas visuais">{variants.map((variant) => { const active = variant.id === selected?.id; return <button className={`concept-card ${active ? "is-selected" : ""}`} type="button" role="radio" aria-checked={active} key={variant.id} onClick={() => setSelectedId(variant.id)}><span className="concept-card__image"><img src={variant.image.url} alt={variant.image.altPtBr} /><i>{variant.label}</i>{active ? <em><span aria-hidden="true">✓</span> Selecionada</em> : null}</span><span className="concept-card__copy"><strong>{variant.titlePtBr}</strong><small>{variant.descriptionPtBr}</small></span></button>; })}</div></section>{showOriginal && selected ? <div className="compare-overlay" role="dialog" aria-modal="true" aria-labelledby="compare-title"><div className="compare-overlay__topbar"><div><span>Original</span><strong id="compare-title">Compare os detalhes</strong></div><button type="button" onClick={() => setShowOriginal(false)} aria-label="Fechar comparação">×</button></div><div className="compare-overlay__images"><figure><img src={previewUrl} alt="Ambiente original" /><figcaption>Antes</figcaption></figure><figure><img src={selected.image.url} alt={selected.image.altPtBr} /><figcaption>Proposta {selected.label}</figcaption></figure></div><Button fullWidth onClick={() => setShowOriginal(false)}>Voltar às propostas</Button></div> : null}</main>
    );
  }

  const prompt = step === "location" ? "Onde fica o imóvel? Informe cidade e UF." : step === "room" ? "Qual ambiente vamos transformar?" : step === "area" ? "Qual é a área aproximada em m²?" : step === "finish" ? "Qual nível de acabamento você prefere?" : "O que você quer mudar ou sentir neste espaço?";
  return (
    <main className="chat-shell">
      <header className="chat-header"><span className="flow-brand"><i>◒</i> ObrIA</span><span>Projeto guiado</span></header>
      <div className="chat-progress"><div className="chat-progress__copy"><strong>{step === "request" ? "Sua ideia" : "Contexto"}</strong><span>Etapa {stepNumber[step]} de 5</span></div><div className="chat-progress__track"><span style={{ width: `${stepNumber[step] * 20}%` }} /></div></div>
      <div className="chat-photo"><img src={previewUrl} alt="Ambiente do projeto" /><span>Foto do ambiente</span></div>
      <section className="chat-box" aria-label="Conversa guiada do projeto"><div className="chat-thread">{answers.map((answer) => <div className="chat-bubble chat-bubble--user" key={answer}>{answer}</div>)}<div className="chat-bubble chat-bubble--assistant chat-prompt"><span>{prompt}</span></div><ChatAnswer step={step} value={step === "location" ? location : step === "area" ? area : request} onValue={step === "location" ? setLocation : step === "area" ? setArea : setRequest} roomType={roomType} finishTier={finishTier} onRoom={(value) => { setRoomType(value); setStep("area"); }} onFinish={(value) => { setFinishTier(value); setStep("request"); }} onNext={() => { if (step === "location" && location.trim().length >= 3) setStep("room"); else if (step === "area" && Number(area.replace(",", ".")) > 0) setStep("finish"); else if (step === "request") void generate(); }} /></div></section>
      {error ? <p className="field__error" role="alert">{error}</p> : null}
    </main>
  );
}

function ChatAnswer({ step, value, onValue, roomType, finishTier, onRoom, onFinish, onNext }: { step: Exclude<Step, "photo" | "generating" | "gallery">; value: string; onValue: (value: string) => void; roomType: RoomType | null; finishTier: FinishTier | null; onRoom: (value: RoomType) => void; onFinish: (value: FinishTier) => void; onNext: () => void }) {
  if (step === "room") return <div className="chat-choice-grid">{rooms.map((room) => <button type="button" className={roomType === room.value ? "is-selected" : ""} key={room.value} onClick={() => onRoom(room.value)}>{room.label}</button>)}</div>;
  if (step === "finish") return <div className="chat-choice-grid">{finishes.map((finish) => <button type="button" className={finishTier === finish.value ? "is-selected" : ""} key={finish.value} onClick={() => onFinish(finish.value)}>{finish.label}</button>)}</div>;
  const requestStep = step === "request";
  return <div className="chat-composer">{requestStep ? <textarea rows={4} maxLength={800} value={value} onChange={(event) => onValue(event.target.value)} placeholder="Ex.: quero uma sala mais clara e acolhedora, preservando o piso" /> : <input inputMode={step === "area" ? "decimal" : "text"} value={value} onChange={(event) => onValue(event.target.value)} placeholder={step === "area" ? "Ex.: 18" : "Ex.: São Paulo, SP"} />}<Button disabled={requestStep ? value.trim().length < 10 : value.trim().length < 1} onClick={onNext}>{requestStep ? "Criar 4 propostas" : "Continuar"}</Button></div>;
}
