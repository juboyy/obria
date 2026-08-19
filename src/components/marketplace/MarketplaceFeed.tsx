'use client';

import { useMemo, useState } from 'react';
import type { ProfessionalMatch } from '@/types';
import { DEMO_PROFESSIONALS } from '@/data/marketplace/professionals';
import { DEMO_PROPOSALS } from '@/data/marketplace/proposals';
import styles from './MarketplaceFeed.module.css';

const PROPOSAL_IMAGES: Record<string, string> = {
  'demo-proposal-ana': '/demo/proposal-ana.svg',
  'demo-proposal-bruno': '/demo/proposal-bruno.svg',
  'demo-proposal-camila': '/demo/proposal-camila.svg',
};

const MATCHES: ProfessionalMatch[] = DEMO_PROFESSIONALS.map((professional, index) => ({
  professional,
  score: [94, 88, 84][index] ?? 80,
  reasons: [
    `Atende em ${professional.city}`,
    `Especialista em ${professional.specialties[0].toLowerCase()}`,
    professional.supportsEcoOptions
      ? 'Experiência demonstrativa com alternativas de menor impacto'
      : 'Faixa econômica compatível com o exemplo',
  ],
}));

const PRICE_LABELS = {
  economy: 'Faixa econômica',
  standard: 'Faixa intermediária',
  premium: 'Faixa premium',
} as const;

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MarketplaceFeed() {
  const [filter, setFilter] = useState<'all' | 'eco' | 'economy'>('all');
  const [notice, setNotice] = useState('');

  const visibleMatches = useMemo(
    () =>
      MATCHES.filter(({ professional }) => {
        if (filter === 'eco') return professional.supportsEcoOptions;
        if (filter === 'economy') return professional.priceTier === 'economy';
        return true;
      }),
    [filter],
  );

  return (
    <main className={styles.shell}>
      <div className={styles.topline}>
        <a className={styles.brand} href="/" aria-label="Obra Clara, início">
          <span className={styles.brandMark} aria-hidden="true">OC</span>
          <span>Obra Clara</span>
        </a>
        <span className={styles.prototypeLabel}>Marketplace protótipo</span>
      </div>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Da ideia para a próxima conversa</p>
          <h1>Projetos com contexto, não apenas pedidos soltos.</h1>
          <p className={styles.lead}>
            Esta vitrine demonstra como um escopo organizado pode ser lido por profissionais. Os perfis, propostas e motivos de compatibilidade abaixo são conteúdo fictício local.
          </p>
        </div>
        <div className={styles.heroNote}>
          <span className={styles.noteNumber}>01</span>
          <p>Nenhum profissional foi contatado. Não há contratação, pagamento ou disponibilidade real nesta experiência.</p>
        </div>
      </header>

      <section className={styles.projectStrip} aria-labelledby="published-project-title">
        <div>
          <p className={styles.eyebrow}>Pedido demonstrativo publicado</p>
          <h2 id="published-project-title">Atualização acolhedora para a sala</h2>
          <p>São Paulo, SP · Sala de estar · aproximadamente 18 m²</p>
        </div>
        <div className={styles.projectMeta}>
          <span>Escopo confirmado</span>
          <strong>3 frentes de trabalho</strong>
        </div>
        <a className={styles.secondaryAction} href="/projeto/demo-project-sala-natural/publicar">Revisar pedido</a>
      </section>

      <section className={styles.section} aria-labelledby="professionals-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Compatibilidade local</p>
            <h2 id="professionals-title">Profissionais demonstrativos</h2>
          </div>
          <label className={styles.filterLabel}>
            <span>Mostrar</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              <option value="all">Todos os perfis</option>
              <option value="eco">Com opções de menor impacto</option>
              <option value="economy">Faixa econômica</option>
            </select>
          </label>
        </div>
        <p className={styles.sectionIntro}>
          A pontuação é uma demonstração determinística baseada no pedido acima — não é busca ao vivo nem garantia de contratação.
        </p>

        {visibleMatches.length > 0 ? (
          <div className={styles.professionalGrid}>
            {visibleMatches.map(({ professional, score, reasons }) => (
              <article className={styles.professionalCard} key={professional.id}>
                <div className={styles.cardVisual}>
                  <img src={professional.portfolioImages[0]} alt={`Ilustração demonstrativa do portfólio de ${professional.name}`} />
                  <span className={styles.demoBadge}>Perfil demonstrativo</span>
                  <span className={styles.matchScore}>{score}% de compatibilidade demonstrativa</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleRow}>
                    <div>
                      <h3>{professional.name}</h3>
                      <p>{professional.city}, {professional.uf} · {PRICE_LABELS[professional.priceTier]}</p>
                    </div>
                    <span className={styles.rating} aria-label={`Nota demonstrativa ${professional.rating} de 5`}>
                      <span aria-hidden="true">★</span> {professional.rating.toFixed(1)}
                    </span>
                  </div>
                  <ul className={styles.tagList} aria-label="Especialidades demonstrativas">
                    {professional.specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}
                  </ul>
                  <details className={styles.details}>
                    <summary>Por que aparece aqui?</summary>
                    <ul>
                      {reasons.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>
                  </details>
                  <div className={styles.cardFooter}>
                    <span>{professional.responseTimeLabel}</span>
                    <button type="button" className={styles.textAction} onClick={() => setNotice(`O perfil de ${professional.name} é apenas uma demonstração local. Conversas e contratação são funcionalidades futuras.`)}>
                      Funcionalidade futura
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <h3>Nenhum perfil neste recorte</h3>
            <p>Escolha outro filtro para continuar explorando os exemplos demonstrativos.</p>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="proposals-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Leituras possíveis para o mesmo escopo</p>
            <h2 id="proposals-title">Propostas demonstrativas</h2>
          </div>
          <span className={styles.countLabel}>{DEMO_PROPOSALS.length} exemplos locais</span>
        </div>
        <div className={styles.proposalGrid}>
          {DEMO_PROPOSALS.map((proposal, index) => {
            const professional = DEMO_PROFESSIONALS.find((item) => item.id === proposal.professionalId);
            return (
              <article className={styles.proposalCard} key={proposal.id}>
                <img className={styles.proposalImage} src={PROPOSAL_IMAGES[proposal.id]} alt={`Conceito demonstrativo: ${proposal.headline}`} />
                <div className={styles.proposalBody}>
                  <div className={styles.cardTitleRow}>
                    <div>
                      <span className={styles.demoBadgeInline}>Perfil demonstrativo</span>
                      <h3>{proposal.headline}</h3>
                    </div>
                    <span className={styles.proposalIndex} aria-hidden="true">0{index + 1}</span>
                  </div>
                  <p className={styles.proposalAuthor}>{professional?.name} · {professional?.city}, {professional?.uf}</p>
                  <p>{proposal.summary}</p>
                  <div className={styles.proposalFacts}>
                    <span>{formatMoney(proposal.priceRange.low)}–{formatMoney(proposal.priceRange.high)}</span>
                    <span>{proposal.estimatedDurationLabel}</span>
                  </div>
                  <ul className={styles.highlightList}>
                    {proposal.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                  {proposal.supportsEcoOptions && <p className={styles.ecoNote}>Inclui alternativas de menor impacto para avaliar com fornecedor.</p>}
                  <button type="button" className={styles.outlineAction} onClick={() => setNotice('A solicitação de proposta é uma funcionalidade futura. Este cartão não representa contato realizado.')}>Funcionalidade futura: solicitar proposta</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Obra Clara · Experiência de demonstração para planejamento de reformas.</p>
        <p>Valores são faixas preliminares. Medição, vistoria e orçamento executivo continuam necessários.</p>
      </footer>

      <p className={styles.liveNotice} aria-live="polite">{notice}</p>
    </main>
  );
}
