"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { projectFlowGateway, type GenerationVariant, type ProjectDraft } from "@/integrations/project-flow";
import type { FinishTier, RoomType } from "@/types";

type GuidedStep = "location" | "room" | "area" | "finish" | "request";
type Step = "photo" | GuidedStep | "generating" | "gallery" | "review" | "complete";
type CameraStatus = "starting" | "live" | "unavailable";
type FacingMode = "environment" | "user";

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

const stepNumber: Record<GuidedStep, number> = {
  location: 1,
  room: 2,
  area: 3,
  finish: 4,
  request: 5,
};

export function MobileIntakeFlow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const [step, setStep] = useState<Step>("photo");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [cameraMessage, setCameraMessage] = useState("");
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [area, setArea] = useState("");
  const [finishTier, setFinishTier] = useState<FinishTier | null>(null);
  const [request, setRequest] = useState("");
  const [variants, setVariants] = useState<GenerationVariant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unavailable");
      setCameraMessage("Este navegador não oferece acesso direto à câmera. Escolha uma foto do aparelho.");
      return;
    }

    stopCamera();
    const requestId = ++cameraRequestRef.current;
    setCameraStatus("starting");
    setCameraMessage("");
    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });

      if (requestId !== cameraRequestRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraStatus("live");
    } catch (cause) {
      stream?.getTracks().forEach((track) => track.stop());
      if (requestId !== cameraRequestRef.current) return;
      const denied = cause instanceof DOMException && cause.name === "NotAllowedError";
      setCameraStatus("unavailable");
      setCameraMessage(denied
        ? "Permita o acesso à câmera para fotografar o ambiente."
        : "Não foi possível abrir a câmera. Você ainda pode escolher uma foto do aparelho.");
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (step !== "photo" || previewUrl) {
      stopCamera();
      return;
    }
    const timer = window.setTimeout(() => void startCamera(), 0);
    return () => {
      window.clearTimeout(timer);
      stopCamera();
    };
  }, [previewUrl, startCamera, step, stopCamera]);

  useEffect(() => () => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl, stopCamera]);

  const roomLabel = rooms.find((room) => room.value === roomType)?.label;
  const finishLabel = finishes.find((finish) => finish.value === finishTier)?.label;
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];
  const answers = useMemo(() => [
    location,
    roomLabel,
    area ? `${area} m²` : "",
    finishLabel,
  ].filter(Boolean), [area, finishLabel, location, roomLabel]);

  function choosePhoto(file?: File) {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Escolha uma foto JPG, PNG ou WebP.");
      return;
    }
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (cameraStatus !== "live" || !video?.videoWidth || !video.videoHeight) {
      await startCamera();
      return;
    }

    const scale = Math.min(1, 1600 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Não foi possível capturar a foto. Tente escolher uma imagem do aparelho.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) {
      setError("Não foi possível capturar a foto. Tente novamente.");
      return;
    }
    choosePhoto(new File([blob], "ambiente-obria.jpg", { type: "image/jpeg" }));
  }

  async function generate() {
    if (!photo || !location || !roomType || !finishTier || !Number(area.replace(",", ".")) || request.trim().length < 10) return;
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

  function resetJourney() {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep("photo");
    setPhoto(null);
    setPreviewUrl("");
    setCameraStatus("starting");
    setCameraMessage("");
    setLocation("");
    setRoomType(null);
    setArea("");
    setFinishTier(null);
    setRequest("");
    setVariants([]);
    setSelectedId("");
    setShowOriginal(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (step === "photo") {
    const cameraLive = cameraStatus === "live";
    const cameraTitle = previewUrl
      ? "Esta foto mostra bem o espaço?"
      : cameraLive
        ? "Enquadre o ambiente"
        : cameraStatus === "starting"
          ? "Abrindo a câmera…"
          : "Sua câmera está fechada";
    const cameraCopy = previewUrl
      ? "Você poderá trocar a foto antes de gerar."
      : cameraLive
        ? "Inclua piso, paredes e janelas no enquadramento."
        : cameraMessage || "Aguarde um instante.";

    return (
      <main className="camera-shell">
        <section className="camera-viewfinder" aria-label="Captura do ambiente">
          <div className="camera-fallback" aria-hidden="true" />
          <video ref={videoRef} className={`camera-video ${cameraLive && !previewUrl ? "is-visible" : ""}`} autoPlay muted playsInline aria-label="Câmera do ambiente" />
          {previewUrl ? <img className="camera-preview" src={previewUrl} alt="Foto escolhida do ambiente" /> : null}
          <div className="camera-shade" aria-hidden="true" />
          <header className="camera-header"><span className="camera-brand"><i aria-hidden="true">◒</i> ObrIA</span></header>
          <div className={`camera-framing-copy ${previewUrl ? "camera-framing-copy--preview" : ""}`} aria-live="polite"><strong>{cameraTitle}</strong><p>{cameraCopy}</p></div>
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => choosePhoto(event.target.files?.[0])} />
          {previewUrl ? (
            <div className="camera-confirmation"><Button variant="secondary" onClick={() => inputRef.current?.click()}>Trocar foto</Button><Button onClick={() => setStep("location")}>Usar esta foto</Button></div>
          ) : (
            <div className="camera-controls">
              <button className="album-control" type="button" onClick={() => inputRef.current?.click()}><span aria-hidden="true" /><small>Galeria</small></button>
              <div className="shutter-slot"><button className="shutter-control" type="button" disabled={cameraStatus === "starting"} onClick={() => void capturePhoto()} aria-label={cameraLive ? "Tirar foto" : "Abrir câmera"}><span /></button><small>{cameraLive ? "Fotografar" : cameraStatus === "starting" ? "Abrindo…" : "Abrir câmera"}</small></div>
              <button className="flip-control" type="button" disabled={!cameraLive} onClick={() => setFacingMode((current) => current === "environment" ? "user" : "environment")} aria-label="Alternar câmera"><span aria-hidden="true">↻</span><small>Virar</small></button>
            </div>
          )}
        </section>
        {error ? <p className="camera-error" role="alert">{error}</p> : null}
      </main>
    );
  }

  if (step === "generating") {
    return (
      <main className="chat-shell chat-shell--single">
        <header className="chat-header"><span className="flow-brand"><i aria-hidden="true">◒</i> ObrIA</span><span>Agente visual</span></header>
        <section className="generating-screen" aria-live="polite"><div className="generating-copy"><p className="flow-kicker">Criando</p><h1>Duas versões fiéis ao seu espaço.</h1><p>A IA altera somente o que você pediu e preserva o restante da foto.</p></div><div className="generation-grid">{["A", "B"].map((label) => <div className="generation-skeleton" key={label}><span>{label}</span><i /></div>)}</div><div className="generation-status"><span className="button__spinner" aria-hidden="true" /><p>Aplicando sua mudança…</p></div><small>Isso costuma levar menos de um minuto.</small></section>
      </main>
    );
  }

  if (step === "gallery") {
    return (
      <main className="chat-shell chat-shell--gallery">
        <header className="chat-header"><span className="flow-brand"><i aria-hidden="true">◒</i> ObrIA</span><span>2 propostas</span></header>
        <section className="gallery-content">
          <div className="gallery-heading"><div><p className="flow-kicker">Resultado</p><h1>Escolha uma versão.</h1></div><button className="compare-action" type="button" onClick={() => setShowOriginal(true)}><span aria-hidden="true">◐</span> Comparar</button></div>
          <p className="flow-copy">As duas propostas preservam a foto original e variam apenas no que você pediu.</p>
          <div className="concept-list" role="radiogroup" aria-label="Propostas visuais">{variants.map((variant) => { const active = variant.id === selected?.id; return <button className={`concept-card ${active ? "is-selected" : ""}`} type="button" role="radio" aria-checked={active} key={variant.id} onClick={() => setSelectedId(variant.id)}><span className="concept-card__image"><img src={variant.image.url} alt={variant.image.altPtBr} /><i>{variant.label}</i>{active ? <em><span aria-hidden="true">✓</span> Escolhida</em> : null}</span><span className="concept-card__copy"><strong>{variant.titlePtBr}</strong><small>{variant.descriptionPtBr}</small></span></button>; })}</div>
        </section>
        <div className="gallery-action"><Button fullWidth disabled={!selected} onClick={() => setStep("review")}>Continuar com proposta {selected?.label}</Button></div>
        {showOriginal && selected ? <div className="compare-overlay" role="dialog" aria-modal="true" aria-labelledby="compare-title"><div className="compare-overlay__topbar"><div><span>Antes e depois</span><strong id="compare-title">Compare os detalhes</strong></div><button type="button" onClick={() => setShowOriginal(false)} aria-label="Fechar comparação">×</button></div><div className="compare-overlay__images"><figure><img src={previewUrl} alt="Ambiente original" /><figcaption>Original</figcaption></figure><figure><img src={selected.image.url} alt={selected.image.altPtBr} /><figcaption>Proposta {selected.label}</figcaption></figure></div><Button fullWidth onClick={() => setShowOriginal(false)}>Voltar às propostas</Button></div> : null}
      </main>
    );
  }

  if (step === "review" && selected) {
    return (
      <main className="chat-shell chat-shell--result">
        <header className="chat-header"><button className="header-back" type="button" onClick={() => setStep("gallery")} aria-label="Voltar às propostas">‹</button><span className="flow-brand"><i aria-hidden="true">◒</i> ObrIA</span><span>Proposta {selected.label}</span></header>
        <section className="result-content"><p className="flow-kicker">Sua escolha</p><h1>Essa é a direção do projeto.</h1><div className="result-hero"><img src={selected.image.url} alt={selected.image.altPtBr} /><span>Proposta {selected.label}</span></div><div className="result-copy"><h2>{selected.titlePtBr}</h2><p>{selected.descriptionPtBr}</p></div><dl className="result-details"><div><dt>Ambiente</dt><dd>{roomLabel}</dd></div><div><dt>Local</dt><dd>{location}</dd></div><div><dt>Área</dt><dd>{area} m²</dd></div><div><dt>Acabamento</dt><dd>{finishLabel}</dd></div></dl><blockquote>{request}</blockquote></section>
        <div className="result-actions"><Button variant="secondary" onClick={() => setStep("gallery")}>Trocar escolha</Button><Button onClick={() => setStep("complete")}>Confirmar proposta</Button></div>
      </main>
    );
  }

  if (step === "complete" && selected) {
    return (
      <main className="chat-shell chat-shell--result">
        <header className="chat-header"><span className="flow-brand"><i aria-hidden="true">◒</i> ObrIA</span><span>Projeto pronto</span></header>
        <section className="result-content result-content--complete"><div className="result-check" aria-hidden="true">✓</div><p className="flow-kicker">Concluído</p><h1>Sua proposta visual está pronta.</h1><p className="flow-copy">Baixe a imagem para guardar e usar como referência nas próximas decisões da reforma.</p><div className="result-hero"><img src={selected.image.url} alt={selected.image.altPtBr} /><span>Proposta {selected.label}</span></div></section>
        <div className="complete-actions"><a className="button button--primary button--default button--full" href={selected.image.url} download={`obria-proposta-${selected.label.toLowerCase()}.jpg`}><span>Baixar imagem</span></a><Button variant="secondary" fullWidth onClick={resetJourney}>Criar outro projeto</Button></div>
      </main>
    );
  }

  const guidedStep = step as GuidedStep;
  const prompt = guidedStep === "location" ? "Onde fica o imóvel? Informe cidade e UF." : guidedStep === "room" ? "Qual ambiente vamos transformar?" : guidedStep === "area" ? "Qual é a área aproximada em m²?" : guidedStep === "finish" ? "Qual nível de acabamento você prefere?" : "O que você quer adicionar ou mudar neste espaço?";
  return (
    <main className="chat-shell">
      <header className="chat-header"><span className="flow-brand"><i aria-hidden="true">◒</i> ObrIA</span><span>Projeto guiado</span></header>
      <div className="chat-progress"><div className="chat-progress__copy"><strong>{guidedStep === "request" ? "Sua ideia" : "Contexto"}</strong><span>Etapa {stepNumber[guidedStep]} de 5</span></div><div className="chat-progress__track"><span style={{ width: `${stepNumber[guidedStep] * 20}%` }} /></div></div>
      <div className="chat-photo"><img src={previewUrl} alt="Ambiente do projeto" /><span>Foto do ambiente</span></div>
      <section className="chat-box" aria-label="Conversa guiada do projeto"><div className="chat-thread">{answers.map((answer) => <div className="chat-bubble chat-bubble--user" key={answer}>{answer}</div>)}<div className="chat-bubble chat-bubble--assistant chat-prompt"><span>{prompt}</span></div><ChatAnswer step={guidedStep} value={guidedStep === "location" ? location : guidedStep === "area" ? area : request} onValue={guidedStep === "location" ? setLocation : guidedStep === "area" ? setArea : setRequest} roomType={roomType} finishTier={finishTier} onRoom={(value) => { setRoomType(value); setStep("area"); }} onFinish={(value) => { setFinishTier(value); setStep("request"); }} onNext={() => { if (guidedStep === "location" && location.trim().length >= 3) setStep("room"); else if (guidedStep === "area" && Number(area.replace(",", ".")) > 0) setStep("finish"); else if (guidedStep === "request") void generate(); }} /></div></section>
      {error ? <p className="field__error" role="alert">{error}</p> : null}
    </main>
  );
}

function ChatAnswer({ step, value, onValue, roomType, finishTier, onRoom, onFinish, onNext }: { step: GuidedStep; value: string; onValue: (value: string) => void; roomType: RoomType | null; finishTier: FinishTier | null; onRoom: (value: RoomType) => void; onFinish: (value: FinishTier) => void; onNext: () => void }) {
  if (step === "room") return <div className="chat-choice-grid">{rooms.map((room) => <button type="button" className={roomType === room.value ? "is-selected" : ""} key={room.value} onClick={() => onRoom(room.value)}>{room.label}</button>)}</div>;
  if (step === "finish") return <div className="chat-choice-grid">{finishes.map((finish) => <button type="button" className={finishTier === finish.value ? "is-selected" : ""} key={finish.value} onClick={() => onFinish(finish.value)}>{finish.label}</button>)}</div>;
  const requestStep = step === "request";
  return <div className="chat-composer">{requestStep ? <textarea rows={4} maxLength={800} value={value} onChange={(event) => onValue(event.target.value)} placeholder="Ex.: adicione um sofá claro sem mudar o restante do ambiente" /> : <input inputMode={step === "area" ? "decimal" : "text"} value={value} onChange={(event) => onValue(event.target.value)} placeholder={step === "area" ? "Ex.: 18" : "Ex.: São Paulo, SP"} />}<Button disabled={requestStep ? value.trim().length < 10 : value.trim().length < 1} onClick={onNext}>{requestStep ? "Criar 2 propostas" : "Continuar"}</Button></div>;
}
