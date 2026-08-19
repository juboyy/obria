import { describe, expect, it } from 'vitest';
import { DEMO_PROFESSIONALS } from '@/data/marketplace/professionals';
import { DEMO_PROPOSALS } from '@/data/marketplace/proposals';
import { createDemoMarketplacePost } from '@/data/marketplace/demo-post';

describe('marketplace demonstration data', () => {
  it('marks every seeded professional and proposal as demonstrative', () => {
    expect(DEMO_PROFESSIONALS.every((professional) => professional.isDemo)).toBe(true);
    expect(DEMO_PROPOSALS.every((proposal) => proposal.isDemo && proposal.status === 'demo')).toBe(true);
  });

  it('keeps the published post at city and UF granularity', () => {
    const post = createDemoMarketplacePost('demo-project-sala-natural');

    expect(post.city).toBe('São Paulo');
    expect(post.uf).toBe('SP');
    expect(JSON.stringify(post)).not.toMatch(/rua|avenida|número|cep|apartamento/i);
  });

  it('does not opt into original image visibility by default', () => {
    expect(createDemoMarketplacePost('demo-project-sala-natural').includeOriginalImage).toBe(false);
  });
});
