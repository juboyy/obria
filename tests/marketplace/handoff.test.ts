import { describe, expect, it } from 'vitest';
import { DEMO_MARKETPLACE_PROJECT_ID, createDemoMarketplacePost } from '@/data/marketplace/demo-post';
import { MARKETPLACE_POST_STORAGE_KEY, parseMarketplacePost } from '@/lib/marketplace/handoff';

function validPost() {
  const post = createDemoMarketplacePost(DEMO_MARKETPLACE_PROJECT_ID);
  if (!post) throw new Error('Expected the canonical demo fixture to exist.');
  return post;
}

describe('parseMarketplacePost', () => {
  it('parses a valid post with the shared storage key', () => {
    const post = validPost();

    expect(MARKETPLACE_POST_STORAGE_KEY).toBe('obria-demo-marketplace-post');
    expect(parseMarketplacePost(JSON.stringify(post), post.projectId)).toEqual(post);
  });

  it('rejects malformed JSON', () => {
    expect(parseMarketplacePost('{not-json', DEMO_MARKETPLACE_PROJECT_ID)).toBeNull();
  });

  it('rejects payloads that fail the marketplace schema', () => {
    const invalidPost = { ...validPost(), confirmedScope: [] };

    expect(parseMarketplacePost(JSON.stringify(invalidPost), invalidPost.projectId)).toBeNull();
  });

  it('rejects a valid payload for a different project', () => {
    const post = validPost();

    expect(parseMarketplacePost(JSON.stringify(post), 'another-project')).toBeNull();
  });

  it('preserves the published status from a valid payload', () => {
    const publishedPost = { ...validPost(), status: 'marketplace_demo_published' as const };

    expect(parseMarketplacePost(JSON.stringify(publishedPost), publishedPost.projectId)?.status).toBe('marketplace_demo_published');
  });
});
