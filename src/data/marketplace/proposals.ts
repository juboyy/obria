import type { DemoProposal } from '@/types';

/**
 * Proposals are seeded examples used to explain the matching concept. They do
 * not represent outreach, availability, or quotes from a real professional.
 */
export const DEMO_PROPOSALS: DemoProposal[] = [
  {
    id: 'demo-proposal-ana',
    isDemo: true,
    professionalId: 'demo-professional-ana',
    projectId: 'demo-project-sala-natural',
    headline: 'Sala leve, com luz quente e materiais fáceis de manter',
    summary:
      'Uma leitura acolhedora para a sala, com pintura de baixa complexidade, iluminação em camadas e alternativas de materiais equivalentes.',
    priceRange: { low: 6800, high: 9200 },
    estimatedDurationLabel: '2 a 3 semanas',
    highlights: [
      'Pintura e preparação de paredes',
      'Iluminação de apoio com instalação prevista',
      'Alternativas equivalentes podem ser avaliadas',
    ],
    supportsEcoOptions: true,
    status: 'demo',
  },
  {
    id: 'demo-proposal-bruno',
    isDemo: true,
    professionalId: 'demo-professional-bruno',
    projectId: 'demo-project-sala-natural',
    headline: 'Piso renovado e pintura objetiva para entregar rápido',
    summary:
      'Uma proposta direta para atualizar a base da sala, priorizando prazo curto e escolhas de manutenção simples.',
    priceRange: { low: 5200, high: 7600 },
    estimatedDurationLabel: '10 a 14 dias',
    highlights: [
      'Troca de piso na área aproximada',
      'Pintura de paredes e teto',
      'Visita técnica ainda seria necessária',
    ],
    supportsEcoOptions: false,
    status: 'demo',
  },
  {
    id: 'demo-proposal-camila',
    isDemo: true,
    professionalId: 'demo-professional-camila',
    projectId: 'demo-project-sala-natural',
    headline: 'Composição durável com curadoria de reuso',
    summary:
      'Uma proposta editorial que combina iluminação, pintura e reaproveitamento quando a condição dos materiais permitir.',
    priceRange: { low: 8400, high: 11800 },
    estimatedDurationLabel: '3 a 5 semanas',
    highlights: [
      'Curadoria de itens que podem ser reaproveitados',
      'Iluminação em camadas',
      'Benefícios dependem de fornecedor e instalação corretos',
    ],
    supportsEcoOptions: true,
    status: 'demo',
  },
];
