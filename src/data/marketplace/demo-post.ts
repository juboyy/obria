import type { ConfirmedScopeItem, MarketplaceProjectPost } from '@/types';

export const DEMO_MARKETPLACE_PROJECT_ID = 'demo-project-sala-natural';

export const DEMO_SUSTAINABILITY_PREFERENCES = [
  'Aceita alternativas equivalentes quando fizerem sentido',
  'Prioriza reaproveitamento se a condição for confirmada',
];

/**
 * The fixture is intentionally local. The selected concept is represented by
 * a variant id because original user media must not be published by default.
 */
export function createDemoMarketplacePost(projectId: typeof DEMO_MARKETPLACE_PROJECT_ID): MarketplaceProjectPost;
export function createDemoMarketplacePost(projectId: string): MarketplaceProjectPost | null {
  if (projectId !== DEMO_MARKETPLACE_PROJECT_ID) return null;

  const confirmedScope: ConfirmedScopeItem[] = [
    {
      id: 'demo-scope-1',
      category: 'wall_painting',
      labelPtBr: 'Preparar e pintar paredes da sala',
      quantity: 18,
      unit: 'm2',
      quantitySource: {
        type: 'assumed',
        assumptionPtBr: 'Área aproximada informada para a demonstração.',
      },
      confirmed: true,
    },
    {
      id: 'demo-scope-2',
      category: 'lighting_point',
      labelPtBr: 'Atualizar iluminação de apoio',
      quantity: 2,
      unit: 'unit',
      quantitySource: {
        type: 'assumed',
        assumptionPtBr: 'Dois pontos de iluminação considerados para a prévia.',
      },
      confirmed: true,
    },
    {
      id: 'demo-scope-3',
      category: 'floor_restoration',
      labelPtBr: 'Avaliar piso existente e alternativas equivalentes',
      quantity: 18,
      unit: 'm2',
      quantitySource: {
        type: 'assumed',
        assumptionPtBr: 'Área aproximada da sala; condição do piso exige vistoria.',
      },
      confirmed: true,
    },
  ];

  return {
    id: `demo-post-${projectId}`,
    projectId,
    title: 'Atualização acolhedora para a sala',
    city: 'São Paulo',
    uf: 'SP',
    roomType: 'living_room',
    areaM2: 18,
    coverVariantId: 'demo-variant-b',
    includeOriginalImage: false,
    confirmedScope,
    estimatePreference: 'both',
    economicRange: { low: 5200, high: 7600 },
    ecologicalRange: { low: 6800, high: 9400 },
    sustainabilityPreferences: DEMO_SUSTAINABILITY_PREFERENCES,
    desiredStart: 'within_30_days',
    datesFlexible: true,
    allowEquivalentAlternatives: true,
    note: 'Busco uma solução acolhedora, com manutenção simples e espaço para avaliar equivalentes.',
    status: 'draft',
  };
}
