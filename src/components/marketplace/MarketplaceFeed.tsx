"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MARKETPLACE_STORAGE_KEY,
  parseMarketplaceProject,
  type MarketplaceSessionProject,
} from "@/integrations/marketplace-session";
import styles from "./MarketplaceFeed.module.css";

const machines = [
  { id: "01", name: "Captura", detail: "Foto validada no dispositivo", state: "done" },
  { id: "02", name: "Contexto", detail: "Brief estruturado pelo agente", state: "done" },
  { id: "03", name: "Motor visual", detail: "2 edições fiéis via API", state: "done" },
  { id: "04", name: "Decisão", detail: "Escolha humana registrada", state: "done" },
  { id: "05", name: "Marketplace", detail: "Projeto preparado na sessão", state: "done" },
  { id: "06", name: "Matching", detail: "Aguardando profissionais reais", state: "waiting" },
  { id: "07", name: "Propostas", detail: "Aguardando respostas verificáveis", state: "waiting" },
] as const;

export function MarketplaceFeed() {
  const [project, setProject] = useState<MarketplaceSessionProject | null>(null);
  useEffect(() => {
    // Browser session storage is the source for this route after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProject(parseMarketplaceProject(window.sessionStorage.getItem(MARKETPLACE_STORAGE_KEY)));
  }, []);

  if (!project) {
    return (
      <main className={styles.shell}>
        <header className={styles.topline}>
          <Link className={styles.brand} href="/"><span aria-hidden="true">◒</span> ObrIA</Link>
          <span className={styles.routeLabel}>Marketplace</span>
        </header>
        <section className={styles.emptyLanding} aria-labelledby="empty-title">
          <span className={styles.agentOrb} aria-hidden="true">◒</span>
          <p className={styles.eyebrow}>Agente do marketplace</p>
          <h1 id="empty-title">Ainda não recebi um projeto nesta sessão.</h1>
          <p>Crie e confirme uma proposta visual. Eu preparo o brief e trago você de volta para acompanhar profissionais e propostas.</p>
          <Link className={styles.primaryAction} href="/">Criar projeto</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topline}>
        <Link className={styles.brand} href="/"><span aria-hidden="true">◒</span> ObrIA</Link>
        <span className={styles.routeLabel}>Marketplace</span>
      </header>

      <section className={styles.hero} aria-labelledby="marketplace-title">
        <div className={styles.agentMessage}>
          <span className={styles.agentOrb} aria-hidden="true">◒</span>
          <div>
            <p className={styles.eyebrow}>Agente do marketplace</p>
            <h1 id="marketplace-title">Organizei seu projeto para a próxima etapa.</h1>
            <p>Seu brief e a proposta visual escolhida estão prontos. Vou manter profissionais e propostas separados até existirem respostas reais.</p>
          </div>
        </div>
        <ol className={styles.agentProgress} aria-label="Andamento do marketplace">
          <li data-state="done"><span>✓</span> Brief pronto</li>
          <li data-state="done"><span>✓</span> Visual aprovado</li>
          <li data-state="waiting"><span>•</span> Matching aguardando conexão</li>
        </ol>
        <p className={styles.localNotice}><strong>Visualização local:</strong> este projeto está salvo apenas nesta sessão do navegador. O envio a profissionais depende da conexão do backend do marketplace.</p>
      </section>

      <section className={styles.section} aria-labelledby="project-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Brief do agente</p><h2 id="project-title">Projeto preparado</h2></div>
          <span className={styles.statusDone}>Pronto</span>
        </div>
        <article className={styles.projectCard}>
          {/* Generated data URI cannot use Next Image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.imageUrl} alt={`Proposta visual ${project.variantLabel} aprovada para ${project.roomLabel}`} />
          <div className={styles.projectBody}>
            <span className={styles.proposalBadge}>Proposta visual {project.variantLabel}</span>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <dl className={styles.projectFacts}>
              <div><dt>Ambiente</dt><dd>{project.roomLabel}</dd></div>
              <div><dt>Local</dt><dd>{project.location}</dd></div>
              {project.areaM2 !== null ? <div><dt>Área</dt><dd>{project.areaM2} m²</dd></div> : null}
              {project.finishLabel ? <div><dt>Acabamento</dt><dd>{project.finishLabel}</dd></div> : null}
            </dl>
            <blockquote>{project.request}</blockquote>
          </div>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="proposals-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Decisões</p><h2 id="proposals-title">Propostas</h2></div>
          <span className={styles.countLabel}>1 visual · 0 comerciais</span>
        </div>
        <div className={styles.proposalGrid}>
          <article className={styles.proposalCard}>
            <span className={styles.statusDone}>Aprovada</span>
            <p className={styles.cardLabel}>Proposta visual</p>
            <h3>{project.title}</h3>
            <p>Esta é a direção escolhida por você e usada como referência para qualquer proposta comercial futura.</p>
          </article>
          <article className={styles.waitingCard}>
            <span className={styles.waitingPulse} aria-hidden="true" />
            <p className={styles.cardLabel}>Propostas comerciais</p>
            <h3>Nenhuma resposta real recebida.</h3>
            <p>Quando fornecedores estiverem conectados, o agente organizará escopo, itens, preço, prazo e validade sem misturar dados simulados.</p>
          </article>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="professionals-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Rede de execução</p><h2 id="professionals-title">Profissionais</h2></div>
          <span className={styles.countLabel}>0 conectados</span>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.agentOrbSmall} aria-hidden="true">◒</span>
          <div><h3>O matching ainda não começou.</h3><p>O agente só exibirá perfis, aderência e disponibilidade recebidos de uma fonte real do marketplace.</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.architecture}`} aria-labelledby="architecture-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Por trás do frontend</p><h2 id="architecture-title">Arquitetura determinística</h2></div>
          <span className={styles.countLabel}>7 máquinas</span>
        </div>
        <p className={styles.sectionIntro}>Cada máquina recebe um estado válido, aplica uma regra explícita e libera apenas a próxima transição. Etapas sem integração real permanecem em espera.</p>
        <ol className={styles.machineGrid}>
          {machines.map((machine) => (
            <li className={styles.machine} data-state={machine.state} key={machine.id}>
              <div className={styles.machineVisual} aria-hidden="true"><span>{machine.id}</span></div>
              <div className={styles.machineCopy}><h3>{machine.name}</h3><p>{machine.detail}</p></div>
            </li>
          ))}
        </ol>
        <div className={styles.transitionRule}>
          <span>Entrada validada</span><i aria-hidden="true">→</i><span>Regra determinística</span><i aria-hidden="true">→</i><span>Saída rastreável</span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>ObrIA mantém decisões humanas e dados reais como gates do processo.</p>
        <Link className={styles.secondaryAction} href="/">Criar outro projeto</Link>
      </footer>
    </main>
  );
}
