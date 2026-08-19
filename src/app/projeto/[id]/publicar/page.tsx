'use client';

import { use } from 'react';
import { PublishPreview } from '@/components/marketplace/PublishPreview';

type PublishPageProps = {
  params: Promise<{ id: string }>;
};

export default function PublishPage({ params }: PublishPageProps) {
  const { id } = use(params);
  return <PublishPreview projectId={id} />;
}
