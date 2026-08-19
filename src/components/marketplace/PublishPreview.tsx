'use client';

import { useState } from 'react';
import type { MarketplaceProjectPost } from '@/types';
import { createDemoMarketplacePost, DEMO_SCOPE_LABELS } from '@/data/marketplace/demo-post';
import styles from './PublishPreview.module.css';

const COVER_IMAGE = '/demo/proposal-ana.svg';
const ORIGINAL_IMAGE = '/demo/professional-ana-01.svg';

type PublishPreviewProps = {
  projectId: string;
};

const START_LABELS: Record<MarketplaceProjectPost['desiredStart'], string> = {
  urgent: 'O quanto antes',
  within_30_days: 'Em até 30 dias',
  one_to_three_months: 'Em 1 a 3 meses',
  researching: 'Ainda pesquisando',
};

function moneyRange(range: MarketplaceProjectPost['economicRange']) {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  return `${formatter.format(range.low)}–${formatter.format(range.high)}`;
}

export function PublishPreview({ projectId }: PublishPreviewProps) {
  const [post, setPost] = useState(() => createDemoMarketplacePost(projectId));
  const [consent, setConsent] = useState(false);
  const [published, setPublished] = useState(false);

  function publishPost() {
    if (!consent) return;
    setPost((current) => ({ ...current, status: 'marketplace_demo_published' }));
    setPublished(true);
  }

  if (published) {
    return (
      <main className={styles.shell}>
        <div className={styles.topline}>
          <a className={styles.brand} href="/" aria-label="Obra Clara, início"><span className={styles.brandMark} aria-hidden="true">OC</span><span>Obra Clara</span></a>
          <span className={styles.prototypeLabel}>Marketplace protótipo</span>
        </div>
        <section className={styles.success} aria-labelledby="success-title">
          <div className={styles.successNumber} aria-hidden="true">✓</div>
          <p className={styles.eyebrow}>Publicação demonstrativa concluída</p>
          <h1 id="success-title">Seu pedido está pronto para receber propostas</h1>
          <p className={styles.successLead}>
            O pedido foi transformado em um estado local de demonstração. Nesta experiência, os perfis e propostas são fictícios: ninguém foi contatado.
          </p>
          <div className={styles.publishedCard}>
            <div>
              <span className={styles.demoBadge}>Pedido demonstrativo</span>
              <h2>{post.title}</h2>
              <p>{post.city}, {post.uf} · {post.areaM2} m² · {START_LABELS[post.desiredStart]}</p>
            </div>
            <strong>{post.estimatePreference === 'both' ? 'Duas estimativas' : post.estimatePreference === 'economic' ? 'Mais econômica' : 'Mais ecológica'}</strong>
          </div>
          <div className={styles.successActions}>
            <a className={styles.primaryAction} href="/marketplace">Explorar marketplace demonstrativo</a>
            <a className={styles.secondaryAction} href={`/projeto/${projectId}/publicar`}>Revisar pedido</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <div className={styles.topline}>
        <a className={styles.brand} href="/" aria-label="Obra Clara, início"><span className={styles.brandMark} aria-hidden="true">OC</span><span>Obra Clara</span></a>
        <span className={styles.prototypeLabel}>Marketplace protótipo</span>
      </div>

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Última etapa do planejamento</p>
          <h1>Revise o pedido antes de publicar.</h1>
          <p className={styles.lead}>O resumo vem do escopo confirmado. Aqui você escolhe apenas como apresentar o pedido no protótipo do marketplace.</p>
        </div>
        <div className={styles.headerAside}>
          <span>Rascunho local</span>
          <strong>1 de 1</strong>
          <p>Nenhum endereço exato é exibido.</p>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.previewColumn} aria-labelledby="preview-title">
          <div className={styles.previewHeader}>
            <div>
              <p className={styles.eyebrow}>Como ficará visível</p>
              <h2 id="preview-title">Prévia do pedido</h2>
            </div>
            <span className={styles.demoBadge}>Conteúdo demonstrativo</span>
          </div>
          <div className={styles.imageGrid}>
            <figure>
              <img src={COVER_IMAGE} alt="Ilustração demonstrativa do conceito selecionado para a sala" />
              <figcaption>Conceito selecionado</figcaption>
            </figure>
            {post.includeOriginalImage && (
              <figure>
                <img src={ORIGINAL_IMAGE} alt="Ilustração demonstrativa da imagem original da sala" />
                <figcaption>Imagem original demonstrativa</figcaption>
              </figure>
            )}
          </div>
          <div className={styles.postCard}>
            <div className={styles.locationRow}>
              <span>{post.city}, {post.uf}</span>
              <span>{post.areaM2} m² aproximados</span>
            </div>
            <h3>{post.title}</h3>
            <p className={styles.roomLabel}>Sala de estar · pedido demonstrativo</p>
            <div className={styles.postSection}>
              <h4>Escopo confirmado</h4>
              <ul className={styles.scopeList}>
                {DEMO_SCOPE_LABELS.map((scope) => <li key={scope}>{scope}</li>)}
              </ul>
            </div>
            <div className={styles.postSection}>
              <h4>Estimativas preliminares</h4>
              <div className={styles.ranges}>
                <span><small>Mais econômica</small><strong>{moneyRange(post.economicRange)}</strong></span>
                <span><small>Mais ecológica</small><strong>{moneyRange(post.ecologicalRange)}</strong></span>
              </div>
              <p className={styles.disclaimer}>Para planejamento. Não substitui medição, vistoria técnica ou orçamento executivo.</p>
            </div>
            <div className={styles.postSection}>
              <h4>Preferências de sustentabilidade</h4>
              <ul className={styles.preferenceList}>{post.sustainabilityPreferences.map((preference) => <li key={preference}>{preference}</li>)}</ul>
            </div>
          </div>
        </section>

        <aside className={styles.formColumn} aria-labelledby="settings-title">
          <div className={styles.formCard}>
            <p className={styles.eyebrow}>Configurações do pedido</p>
            <h2 id="settings-title">Escolha o enquadramento</h2>
            <label className={styles.fieldLabel} htmlFor="post-title">Título do pedido</label>
            <input id="post-title" value={post.title} maxLength={100} onChange={(event) => setPost((current) => ({ ...current, title: event.target.value }))} />

            <fieldset className={styles.fieldset}>
              <legend>Estimativa de preferência</legend>
              {(['economic', 'ecological', 'both'] as const).map((preference) => (
                <label className={styles.radioRow} key={preference}>
                  <input type="radio" name="estimatePreference" checked={post.estimatePreference === preference} onChange={() => setPost((current) => ({ ...current, estimatePreference: preference }))} />
                  <span>{preference === 'economic' ? 'Mais econômica' : preference === 'ecological' ? 'Mais ecológica' : 'Quero receber as duas'}</span>
                </label>
              ))}
            </fieldset>

            <label className={styles.fieldLabel} htmlFor="desired-start">Quando você espera começar?</label>
            <select id="desired-start" value={post.desiredStart} onChange={(event) => setPost((current) => ({ ...current, desiredStart: event.target.value as MarketplaceProjectPost['desiredStart'] }))}>
              {Object.entries(START_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className={styles.checkRow}><input type="checkbox" checked={post.datesFlexible} onChange={(event) => setPost((current) => ({ ...current, datesFlexible: event.target.checked }))} /><span>Tenho flexibilidade de datas</span></label>
            <label className={styles.checkRow}><input type="checkbox" checked={post.allowEquivalentAlternatives} onChange={(event) => setPost((current) => ({ ...current, allowEquivalentAlternatives: event.target.checked }))} /><span>Aceito avaliar alternativas equivalentes</span></label>
            <label className={styles.checkRow}><input type="checkbox" checked={post.includeOriginalImage} onChange={(event) => setPost((current) => ({ ...current, includeOriginalImage: event.target.checked }))} /><span>Exibir também a imagem original demonstrativa</span></label>

            <label className={styles.fieldLabel} htmlFor="post-note">Observação opcional</label>
            <textarea id="post-note" maxLength={300} rows={4} value={post.note ?? ''} onChange={(event) => setPost((current) => ({ ...current, note: event.target.value }))} />
            <p className={styles.characterCount}>{(post.note ?? '').length}/300</p>

            <label className={styles.consentRow}>
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Autorizo a exibição deste pedido e das imagens no protótipo do marketplace.</span>
            </label>
            <button type="button" className={styles.publishAction} disabled={!consent} onClick={publishPost}>Publicar pedido</button>
            {!consent && <p className={styles.helperText}>Marque a autorização para habilitar a publicação demonstrativa.</p>}
            <p className={styles.boundaryNote}>Esta ação altera apenas o estado local desta demonstração. Não envia mensagens nem cria contato real.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
