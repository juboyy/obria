'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MarketplaceProjectPost } from '@/types';
import { marketplaceProjectPostSchema } from '@/lib/api/schemas';
import { createDemoMarketplacePost, DEMO_MARKETPLACE_PROJECT_ID } from '@/data/marketplace/demo-post';
import { MARKETPLACE_POST_STORAGE_KEY, parseMarketplacePost } from '@/lib/marketplace/handoff';
import styles from './PublishPreview.module.css';

const COVER_IMAGES: Record<string, string> = {
  'concept-a': '/demo/proposal-ana.svg',
  'concept-b': '/demo/proposal-bruno.svg',
  'concept-c': '/demo/proposal-camila.svg',
  'concept-d': '/demo/proposal-ana.svg',
  'demo-variant-b': '/demo/proposal-bruno.svg',
};
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
const ROOM_LABELS: Record<MarketplaceProjectPost['roomType'], string> = {
  living_room: 'Sala de estar',
  bedroom: 'Quarto',
  kitchen: 'Cozinha',
  bathroom: 'Banheiro',
  office: 'Escritório',
  other: 'Outro ambiente',
};

function moneyRange(range: MarketplaceProjectPost['economicRange']) {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  return `${formatter.format(range.low)}–${formatter.format(range.high)}`;
}

export function PublishPreview({ projectId }: PublishPreviewProps) {
  const [post, setPost] = useState<MarketplaceProjectPost | null>(null);
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      const raw = window.localStorage.getItem(MARKETPLACE_POST_STORAGE_KEY);
      const storedPost = parseMarketplacePost(raw, projectId);
      const fixturePost = raw === null && projectId === DEMO_MARKETPLACE_PROJECT_ID
        ? createDemoMarketplacePost(projectId)
        : null;

      if (cancelled) return;
      setPost(storedPost ?? fixturePost);
      setPublished(storedPost?.status === 'marketplace_demo_published');
      setReady(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [projectId]);

  useEffect(() => {
    if (!ready || !post) return;
    const parsed = marketplaceProjectPostSchema.safeParse(post);
    if (parsed.success) window.localStorage.setItem(MARKETPLACE_POST_STORAGE_KEY, JSON.stringify(parsed.data));
  }, [post, ready]);

  function publishPost() {
    if (!consent || !post) return;
    const parsed = marketplaceProjectPostSchema.safeParse({ ...post, status: 'marketplace_demo_published' });
    if (!parsed.success) return;
    setPost(parsed.data);
    setPublished(true);
  }

  if (!ready) return null;

  if (!post) {
    return (
      <main className={styles.shell}>
        <div className={styles.topline}>
          <Link className={styles.brand} href="/" aria-label="ObrIA, início"><span className={styles.brandMark} aria-hidden="true">IA</span><span>ObrIA</span></Link>
          <span className={styles.prototypeLabel}>Marketplace protótipo</span>
        </div>
        <section className={styles.success} aria-labelledby="recovery-title">
          <p className={styles.eyebrow}>Pedido não encontrado</p>
          <h1 id="recovery-title">Esse resumo precisa ser retomado na jornada principal.</h1>
          <p className={styles.successLead}>Não encontramos um pedido válido para este endereço neste navegador. Volte ao início para montar o escopo novamente.</p>
          <div className={styles.successActions}>
            <Link className={styles.primaryAction} href="/">Voltar ao início</Link>
          </div>
        </section>
      </main>
    );
  }

  if (published) {
    return (
      <main className={styles.shell}>
        <div className={styles.topline}>
          <Link className={styles.brand} href="/" aria-label="ObrIA, início"><span className={styles.brandMark} aria-hidden="true">IA</span><span>ObrIA</span></Link>
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

  const titleValid = post.title.trim().length >= 3;
  const coverImage = COVER_IMAGES[post.coverVariantId] ?? COVER_IMAGES['concept-a'];

  return (
    <main className={styles.shell}>
      <div className={styles.topline}>
        <Link className={styles.brand} href="/" aria-label="ObrIA, início"><span className={styles.brandMark} aria-hidden="true">IA</span><span>ObrIA</span></Link>
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
              <img src={coverImage} alt={`Ilustração demonstrativa do conceito selecionado para ${ROOM_LABELS[post.roomType].toLowerCase()}`} />
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
            <p className={styles.roomLabel}>{ROOM_LABELS[post.roomType]} · pedido demonstrativo</p>
            <div className={styles.postSection}>
              <h4>Escopo confirmado</h4>
              <ul className={styles.scopeList}>
                {post.confirmedScope.map((scope) => <li key={scope.id}>{scope.labelPtBr}</li>)}
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
            <input id="post-title" value={post.title} minLength={3} maxLength={100} aria-invalid={!titleValid} onChange={(event) => setPost((current) => current ? { ...current, title: event.target.value } : current)} />
            {!titleValid && <p className={styles.helperText}>Use pelo menos 3 caracteres no título.</p>}

            <fieldset className={styles.fieldset}>
              <legend>Estimativa de preferência</legend>
              {(['economic', 'ecological', 'both'] as const).map((preference) => (
                <label className={styles.radioRow} key={preference}>
                  <input type="radio" name="estimatePreference" checked={post.estimatePreference === preference} onChange={() => setPost((current) => current ? { ...current, estimatePreference: preference } : current)} />
                  <span>{preference === 'economic' ? 'Mais econômica' : preference === 'ecological' ? 'Mais ecológica' : 'Quero receber as duas'}</span>
                </label>
              ))}
            </fieldset>

            <label className={styles.fieldLabel} htmlFor="desired-start">Quando você espera começar?</label>
            <select id="desired-start" value={post.desiredStart} onChange={(event) => setPost((current) => current ? { ...current, desiredStart: event.target.value as MarketplaceProjectPost['desiredStart'] } : current)}>
              {Object.entries(START_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label className={styles.checkRow}><input type="checkbox" checked={post.datesFlexible} onChange={(event) => setPost((current) => current ? { ...current, datesFlexible: event.target.checked } : current)} /><span>Tenho flexibilidade de datas</span></label>
            <label className={styles.checkRow}><input type="checkbox" checked={post.allowEquivalentAlternatives} onChange={(event) => setPost((current) => current ? { ...current, allowEquivalentAlternatives: event.target.checked } : current)} /><span>Aceito avaliar alternativas equivalentes</span></label>
            <label className={styles.checkRow}><input type="checkbox" checked={post.includeOriginalImage} onChange={(event) => setPost((current) => current ? { ...current, includeOriginalImage: event.target.checked } : current)} /><span>Exibir também a imagem original demonstrativa</span></label>

            <label className={styles.fieldLabel} htmlFor="post-note">Observação opcional</label>
            <textarea id="post-note" maxLength={300} rows={4} value={post.note ?? ''} onChange={(event) => setPost((current) => current ? { ...current, note: event.target.value } : current)} />
            <p className={styles.characterCount}>{(post.note ?? '').length}/300</p>

            <label className={styles.consentRow}>
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Autorizo a exibição deste pedido e das imagens no protótipo do marketplace.</span>
            </label>
            <button type="button" className={styles.publishAction} disabled={!consent || !titleValid} onClick={publishPost}>Publicar pedido</button>
            {!consent && <p className={styles.helperText}>Marque a autorização para habilitar a publicação demonstrativa.</p>}
            <p className={styles.boundaryNote}>Esta ação altera apenas o estado local desta demonstração. Não envia mensagens nem cria contato real.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
