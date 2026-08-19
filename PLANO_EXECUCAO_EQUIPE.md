# Plano de Execução da Equipe — Obra Clara

| Campo | Definição |
| --- | --- |
| Data | 2026-08-19 |
| Equipe | Artur, João e Fabio |
| Prazo | Entrega do MVP hoje |
| Referência de produto | [PRD.md](./PRD.md) |
| Objetivo | Entregar o fluxo completo de foto até publicação no marketplace demonstrativo |

## 1. Princípio da divisão

A divisão considera os perfis reais da equipe:

- **João:** perfil técnico e interesse em desenvolver o mecanismo de busca.
- **Artur:** perfil de produto, responsável por experiência, prioridade e apresentação.
- **Fabio:** início na área, com tarefas importantes, delimitadas e de menor risco técnico.

Não devemos buscar uma divisão exatamente igual em quantidade de código. A prioridade é colocar cada pessoa na frente em que consegue entregar com mais velocidade e menor risco.

O trabalho será dividido em três frentes:

1. **Plataforma, IA e busca — João**
2. **Produto, experiência e integração — Artur**
3. **Marketplace demonstrativo e suporte de qualidade — Fabio**

## 2. Responsabilidades individuais

### 2.1 João — líder técnico, IA e mecanismo de busca

#### Missão

Garantir que a base técnica e os fluxos de maior risco funcionem: upload, geração de imagens, refinamento, estimativas e busca de profissionais.

#### Responsabilidades

- Definir a arquitetura técnica junto com Artur.
- Criar os contratos TypeScript e schemas Zod compartilhados.
- Configurar Supabase, tabelas e bucket privado.
- Implementar upload assinado e acesso privado às imagens.
- Integrar a API da OpenAI.
- Gerar quatro propostas visuais.
- Usar a imagem selecionada como origem do refinamento.
- Implementar extração estruturada do escopo.
- Implementar regras das perguntas complementares.
- Implementar o cálculo determinístico das duas estimativas.
- Implementar o catálogo de alternativas ecológicas em conjunto com as definições de produto do Artur.
- Desenvolver o mecanismo de busca e ranking de profissionais.
- Mapear erros, limites e tentativas de recuperação.
- Revisar todo código que acessa APIs, banco, storage ou valores monetários.

#### Mecanismo de busca recomendado

Para o MVP, a busca deve ser determinística e funcionar sobre profissionais fictícios armazenados localmente. Não usar embeddings, banco vetorial ou busca semântica nesta entrega.

Entradas do ranking:

- Cidade e UF do projeto.
- Categorias de serviço confirmadas.
- Faixa de orçamento.
- Preferência econômica, ecológica ou ambas.
- Prazo desejado.
- Regiões, especialidades e disponibilidade do profissional.

Pontuação sugerida:

```text
30% cobertura de localização
30% compatibilidade de serviços
20% compatibilidade de orçamento
10% experiência com opções ecológicas
10% disponibilidade
```

Saída esperada:

```ts
type ProfessionalMatch = {
  professionalId: string;
  score: number;
  reasons: string[];
};
```

Exemplo:

```ts
{
  professionalId: 'demo-01',
  score: 88,
  reasons: [
    'Atende em São Paulo',
    'Especialista em pintura e instalação de pisos',
    'Compatível com a faixa estimada',
    'Experiência com reaproveitamento de materiais'
  ]
}
```

#### Arquivos sob responsabilidade

```text
src/types/**
src/app/api/projects/**
src/app/api/uploads/**
src/app/api/generations/**
src/app/api/scope/**
src/app/api/estimates/**
src/lib/ai/**
src/lib/auth/**
src/lib/storage/**
src/lib/supabase/**
src/lib/questions/**
src/lib/estimate/**
src/lib/eco/**
src/lib/matching/**
src/data/costs/**
src/data/eco/**
supabase/**
package.json
package-lock.json
next.config.*
tests/ai/**
tests/estimate/**
tests/matching/**
```

#### O que João não deve assumir

- Ajustes finos de layout e identidade visual.
- Escrita da apresentação e narrativa de produto.
- Construção das telas estáticas do marketplace.
- Features P1 antes do fluxo principal funcionar.

### 2.2 Artur — líder de produto, experiência e integração

#### Missão

Garantir que o produto tenha um fluxo coerente, seja fácil de entender, represente corretamente as limitações e esteja pronto para apresentação e submissão.

#### Responsabilidades

- Tomar decisões de produto e cortar escopo quando necessário.
- Definir o happy path e os critérios de aceite.
- Desenhar a hierarquia visual e o fluxo das telas.
- Criar ou coordenar a implementação do design system.
- Implementar a experiência principal usando mocks tipados enquanto João constrói o backend.
- Construir upload/intake, progresso, galeria, seleção e refinamento no frontend.
- Construir perguntas, confirmação de escopo e comparação das estimativas no frontend.
- Definir textos, avisos, estados vazios, erros e conteúdo educativo.
- Definir com João quais alternativas ecológicas entram no MVP.
- Integrar as APIs do João às telas.
- Integrar a saída do projeto ao marketplace construído pelo Fabio.
- Fazer revisão de UX, responsividade e acessibilidade.
- Controlar PRD, README, roteiro, vídeo, demo e submissão.
- Ser o responsável final pelo deploy na Vercel.

#### Arquivos sob responsabilidade

```text
src/app/page.tsx
src/app/projeto/** (exceto src/app/projeto/[id]/publicar/**)
src/components/ui/**
src/components/creation/**
src/components/generation/**
src/components/scope/**
src/components/estimates/**
src/app/globals.css
src/app/layout.tsx
docs/**
README.md
coordenação do deploy
```

#### Regras de produto que Artur deve proteger

- A ferramenta entrega uma estimativa preliminar, não um orçamento vinculante.
- Nenhum preço pode vir diretamente do modelo.
- Nenhuma afirmação ecológica numérica pode ser exibida sem fonte e cálculo verificável.
- A opção ecológica não deve ser moralmente imposta ao usuário.
- O marketplace precisa ser identificado como protótipo.
- Perfis fictícios devem exibir `Perfil demonstrativo`.
- O endereço completo do usuário nunca aparece no marketplace.

#### O que Artur não deve assumir

- Alterar migrations ou contratos de API sem alinhar com João.
- Construir um segundo backend paralelo.
- Fazer features visuais P1 enquanto o fluxo real estiver quebrado.

### 2.3 Fabio — marketplace demonstrativo e suporte de qualidade

#### Missão

Entregar uma parte visível e importante do produto dentro de um escopo seguro: o final do fluxo, no qual o projeto é publicado e profissionais demonstrativos são apresentados.

Fabio deve trabalhar com componentes e dados já tipados. Ele não deve ficar responsável por APIs críticas, autenticação, cálculo financeiro ou integrações externas.

#### Responsabilidades

- Criar dados fictícios de profissionais e propostas.
- Garantir que todos os dados tenham `isDemo: true`.
- Construir cards de profissionais.
- Construir cards de propostas.
- Construir o preview da publicação do projeto.
- Construir o estado de sucesso após `Publicar pedido`.
- Construir a página/feed do marketplace.
- Implementar filtros locais simples somente se o P0 estiver concluído.
- Usar os componentes do design system criados pelo Artur.
- Testar responsividade das telas do marketplace.
- Testar o happy path completo e registrar bugs reproduzíveis.
- Conferir textos, labels, imagens quebradas e estados vazios.
- Ajudar na preparação dos dados de demonstração, screenshots e vídeo.

#### Arquivos sob responsabilidade

```text
src/app/marketplace/**
src/app/projeto/[id]/publicar/**
src/components/marketplace/**
src/data/marketplace/**
public/demo/**
tests/marketplace/**
```

Fabio pode consumir os tipos de `src/types/**`, mas não deve alterá-los sem solicitar ao João.

#### Entregáveis mínimos do Fabio

1. Página de preview do pedido.
2. Botão `Publicar pedido`.
3. Estado de publicação concluída.
4. Três cards de profissionais demonstrativos.
5. Três cards de propostas demonstrativas.
6. Badge visível `Perfil demonstrativo`.
7. Layout funcional em mobile e desktop.

#### Tarefas opcionais do Fabio

Somente depois dos entregáveis mínimos:

- Filtros por categoria, UF e preferência ecológica.
- Drawer de detalhes do profissional.
- Busca textual local por nome/especialidade.
- Animações e refinamentos visuais.

#### O que Fabio não deve alterar

```text
src/app/api/**
src/lib/ai/**
src/lib/estimate/**
src/lib/storage/**
src/lib/supabase/**
src/types/**
supabase/**
package.json
```

Qualquer necessidade nessas áreas deve virar uma solicitação objetiva para João ou Artur.

## 3. Contratos necessários antes do trabalho paralelo

Nos primeiros 20–30 minutos, Artur e João devem fechar os contratos abaixo. Fabio só precisa receber os tipos prontos para começar com mocks.

### 3.1 Dados de profissional

```ts
type DemoProfessional = {
  id: string;
  isDemo: true;
  name: string;
  city: string;
  uf: string;
  specialties: string[];
  priceTier: 'economy' | 'standard' | 'premium';
  supportsEcoOptions: boolean;
  availability: 'immediate' | 'within_30_days' | 'one_to_three_months';
  responseTimeLabel: string;
  rating: number;
  reviewCount: number;
  portfolioImages: string[];
};
```

### 3.2 Publicação do projeto

```ts
type MarketplaceProjectPost = {
  id: string;
  projectId: string;
  title: string;
  city: string;
  uf: string;
  roomType: string;
  areaM2: number;
  coverImageUrl: string;
  scopeLabels: string[];
  estimatePreference: 'economic' | 'ecological' | 'both';
  economicRange: { low: number; high: number };
  ecologicalRange: { low: number; high: number };
  desiredStart: string;
  sustainabilityPreferences: string[];
  status: 'draft' | 'marketplace_demo_published';
};
```

### 3.3 Resultado da busca

```ts
type ProfessionalMatch = {
  professional: DemoProfessional;
  score: number;
  reasons: string[];
};
```

## 4. Cronograma de seis horas

### 00:00–00:20 — alinhamento e gates

#### João

- Inicializar/configurar a base técnica.
- Definir schemas compartilhados.
- Validar chave e acesso à OpenAI.
- Executar uma edição real de imagem com quatro resultados.

#### Artur

- Fechar o happy path.
- Desenhar rapidamente as seis etapas principais.
- Preparar textos e foto de demonstração.
- Definir o contrato de saída para o marketplace.

#### Fabio

- Preparar estrutura dos dados fictícios.
- Separar imagens de demonstração autorizadas.
- Conferir o PRD e os componentes que deverá entregar.

**Gate:** não avançar para polimento sem confirmar que a geração de quatro imagens funciona.

### 00:20–02:00 — desenvolvimento paralelo

#### João

- Projeto/sessão.
- Upload privado.
- Geração inicial.
- Persistência das quatro imagens.
- Seleção e refinamento.

#### Artur

- Design system mínimo.
- Intake e upload visual.
- Progresso.
- Galeria de quatro opções.
- Seleção/refinamento com mocks.

#### Fabio

- Dados fictícios de profissionais/propostas.
- Cards do marketplace.
- Página do marketplace com mocks.
- Badge e avisos demonstrativos.

**Gate em 02:00:** João e Artur devem conectar upload → quatro imagens → seleção.

### 02:00–03:00 — integração do fluxo visual

#### João

- Conectar backend real.
- Corrigir erros de storage/OpenAI.
- Confirmar que o refinamento usa a imagem selecionada.

#### Artur

- Integrar APIs reais.
- Corrigir estados de loading/erro.
- Testar mobile.

#### Fabio

- Finalizar preview e sucesso de publicação.
- Preparar mocks usando o contrato real.
- Iniciar testes do fluxo principal.

**Gate em 03:00:** o fluxo até a imagem aprovada deve funcionar no deploy.

### 03:00–04:00 — estimativas e busca

#### João

- Escopo estruturado.
- Perguntas determinísticas.
- Estimativa econômica.
- Estimativa ecológica.
- Ranking dos profissionais.

#### Artur

- UI de perguntas e confirmação.
- UI de comparação das estimativas.
- Textos educativos e disclaimers.
- Montagem do post a partir do projeto.

#### Fabio

- Conectar o post real ao marketplace.
- Exibir top três resultados do ranking.
- Corrigir marketplace mobile/desktop.

**Gate em 04:00:** o happy path deve chegar até a publicação e lista de profissionais.

### 04:00–04:45 — congelamento e qualidade

#### João

- Testes unitários críticos.
- Tratamento de erros.
- Checagem de chaves, storage e logs.
- Revisão do código do Fabio que consome o ranking.

#### Artur

- Revisão completa de UX e conteúdo.
- Cortar P1.
- Conferir limitações e claims ecológicos.
- Coordenar correções finais.

#### Fabio

- Executar o roteiro completo pelo menos três vezes.
- Abrir bugs com passos claros.
- Corrigir bugs visuais simples.
- Verificar imagens, textos e badges demonstrativos.

### 04:45–05:15 — produção

- Artur realiza o deploy final.
- João acompanha logs e corrige apenas bloqueadores.
- Fabio executa o smoke test em janela anônima e em celular.
- Congelar dependências, schemas e features.

### 05:15–06:00 — submissão

#### Artur

- Liderar gravação, narrativa e submissão.

#### João

- Preparar respostas técnicas e explicar arquitetura/busca.

#### Fabio

- Operar a demo, preparar dados e conferir todos os links.

Todos devem ensaiar a apresentação de três minutos duas vezes.

## 5. Regras de colaboração

### 5.1 Dono único por arquivo

Não editar arquivos pertencentes a outra frente sem conversar primeiro. Isso é especialmente importante porque agentes de código podem editar o mesmo workspace.

### 5.2 Commits frequentes

- Commit a cada 45–60 minutos.
- Commits pequenos e descritivos.
- Não deixar integração para o final.
- Antes de iniciar uma alteração compartilhada, avisar a equipe.

### 5.3 Mudanças de contrato

- Artur define a necessidade do produto.
- João define e implementa o contrato técnico.
- Fabio consome o contrato sem criar uma versão paralela.
- João é o único responsável por instalar dependências ou alterar `package.json` durante o sprint.

### 5.4 Uso de agentes

Cada pessoa pode usar agentes de código, mas deve limitar os agentes aos caminhos sob sua responsabilidade.

Ao delegar, sempre informar:

- Objetivo.
- Arquivos permitidos.
- Arquivos proibidos.
- Contrato de entrada/saída.
- Critérios de aceite.
- Testes esperados.

### 5.5 Escalonamento de bloqueios

- Bloqueio técnico crítico → João.
- Dúvida de prioridade/escopo → Artur.
- Bug visual isolado no marketplace → Fabio.
- Qualquer bloqueio acima de 15 minutos deve ser comunicado.

## 6. Ordem de integração

Integrar estritamente nesta sequência:

1. Criar projeto.
2. Upload privado.
3. Gerar quatro imagens.
4. Selecionar imagem.
5. Refinar imagem selecionada.
6. Extrair e confirmar escopo.
7. Calcular duas estimativas.
8. Escolher preferência.
9. Montar publicação.
10. Executar ranking.
11. Mostrar marketplace demonstrativo.

Não integrar o marketplace antes de o objeto `MarketplaceProjectPost` existir com mocks válidos.

## 7. Critérios de conclusão por pessoa

### João concluído quando

- [ ] Quatro imagens são geradas e armazenadas.
- [ ] Refinamento parte da imagem selecionada.
- [ ] Escopo e perguntas respeitam schemas.
- [ ] Nenhum preço vem do modelo.
- [ ] Duas estimativas são determinísticas.
- [ ] Ranking retorna top três e motivos.
- [ ] Erros críticos são tratados.
- [ ] Nenhuma chave está no frontend.

### Artur concluído quando

- [ ] Fluxo completo está claro sem explicação externa.
- [ ] Loading, erro e sucesso possuem estados úteis.
- [ ] Comparação econômico/ecológico é compreensível.
- [ ] Marketplace recebe dados sem novo preenchimento de escopo.
- [ ] Mobile e desktop funcionam.
- [ ] PRD, README, roteiro e submissão estão prontos.

### Fabio concluído quando

- [ ] Preview do pedido está pronto.
- [ ] Publicação demonstrativa funciona.
- [ ] Cards usam dados tipados.
- [ ] Top três matches são exibidos.
- [ ] Perfis e propostas estão claramente marcados como demonstrativos.
- [ ] Marketplace funciona em mobile e desktop.
- [ ] Happy path foi testado e bugs foram reportados/corrigidos.

## 8. O que cortar primeiro

Se o cronograma atrasar:

1. Remover filtros e busca textual do marketplace.
2. Remover drawer de profissional.
3. Manter somente três profissionais e três propostas.
4. Reduzir as alternativas ecológicas para três escolhas bem justificadas.
5. Usar checklist manual se a extração estruturada falhar.
6. Manter obrigatoriamente foto, quatro imagens, seleção, refinamento, duas estimativas e publicação demonstrativa.

## 9. Resumo executivo

```text
JOÃO
Técnico + IA + backend + estimativas + busca/ranking

ARTUR
Produto + UX/UI principal + integração + deploy + apresentação

FABIO
Marketplace UI + dados demonstrativos + QA + suporte à demo
```

Essa divisão concentra os pontos de maior risco técnico com João, mantém Artur responsável pela coerência do produto e oferece ao Fabio uma frente concreta, visível e segura para entregar valor sem depender de conhecimentos avançados de infraestrutura.
