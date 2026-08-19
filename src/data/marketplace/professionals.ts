import type { DemoProfessional } from '@/types';

/**
 * Seeded profiles for the marketplace prototype. These are fictional records,
 * not verified providers and not a live directory.
 */
export const DEMO_PROFESSIONALS: DemoProfessional[] = [
  {
    id: 'demo-professional-ana',
    isDemo: true,
    name: 'Ana Martins Studio',
    city: 'São Paulo',
    uf: 'SP',
    specialties: ['Pintura residencial', 'Iluminação', 'Curadoria de materiais'],
    priceTier: 'standard',
    supportsEcoOptions: true,
    availability: 'within_30_days',
    responseTimeLabel: 'Responde em até 4h',
    rating: 4.9,
    reviewCount: 28,
    portfolioImages: [
      '/demo/professional-ana-01.svg',
      '/demo/professional-ana-02.svg',
    ],
  },
  {
    id: 'demo-professional-bruno',
    isDemo: true,
    name: 'Bruno Lima Reformas',
    city: 'Campinas',
    uf: 'SP',
    specialties: ['Pisos e revestimentos', 'Marcenaria leve', 'Pintura residencial'],
    priceTier: 'economy',
    supportsEcoOptions: false,
    availability: 'immediate',
    responseTimeLabel: 'Responde em até 8h',
    rating: 4.7,
    reviewCount: 19,
    portfolioImages: [
      '/demo/professional-bruno-01.svg',
      '/demo/professional-bruno-02.svg',
    ],
  },
  {
    id: 'demo-professional-camila',
    isDemo: true,
    name: 'Camila Rocha Interiores',
    city: 'Santos',
    uf: 'SP',
    specialties: ['Interiores', 'Reuso de materiais', 'Iluminação'],
    priceTier: 'premium',
    supportsEcoOptions: true,
    availability: 'one_to_three_months',
    responseTimeLabel: 'Responde em até 1 dia',
    rating: 4.8,
    reviewCount: 34,
    portfolioImages: [
      '/demo/professional-camila-01.svg',
      '/demo/professional-camila-02.svg',
    ],
  },
];
