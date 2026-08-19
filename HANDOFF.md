# Obria MVP: handoff para agente de backend/produto

## Objetivo

Executar o plano aprovado em `local://obria-mvp-plan.md`, priorizando backend, domínio, persistência, contratos e verificações. A UI foi interrompida a pedido do João. Não investir em refinamento visual ou UX nesta etapa.

## Estado atual

Repositório: `D:/obria`

A aplicação Next foi criada, mas o scaffold não completou a instalação online por lentidão da rede. Para permitir trabalho local rápido, o diretório `node_modules` está apontando para `D:/aumi-cockpit/node_modules`. Isso é apenas um desbloqueio local e não é portátil.

Manifest atual: `D:/obria/package.json`

- Next `15.5.19`, React `19.2.7`, React DOM `19.2.7`, Zod `3.25.76`
- Scripts declarados: `dev`, `lint`, `test`, `test:e2e`, `build`, `demo:record`, `demo:reset`, `demo:determinism`, `mcp:smoke`
- O plano aprovado pedia Next `16.3.1`, React `19.2.8`, Zod `4.4.3` e dependências adicionais. A instalação pinned não foi concluída.
- O build não foi executado após a última alteração porque o foco mudou para este handoff.

## Código já criado

- `src/domain/obria.ts`
  - Schemas Zod para briefing, análise, plano, quantitativos, projeto, versão, oportunidade e proposta.
  - Estados e transições de projeto.
  - `estimateQuantities()` com fórmulas em milímetros e centavos.
  - Mapa de referências SINAPI reduzido para o cenário demo.
- `src/server/demo-store.ts`
  - Estado local JSON em `data/demo-state.json`.
  - IDs fixos de cliente, fornecedor e projeto.
  - Fixture determinística de São Paulo.
  - Versões V1 e V2 com imagem SVG data URI.
- `src/server/providers/media-provider.ts`
  - Contrato `MediaProvider`.
  - `ReplayMediaProvider` determinístico.
  - `LiveMediaProvider` ainda é somente um guard de chave e cai na geração replay. Não tratar como integração live concluída.
- `src/server/services/obria-service.ts`
  - `authorizeAction()` e ações de criar projeto, iterar, aprovar, publicar, propor e aceitar.
  - Isolamento básico por papel cliente/fornecedor.
- Rotas HTTP criadas:
  - `src/app/api/demo/route.ts`
  - `src/app/api/projects/route.ts`
  - `src/app/api/projects/[id]/designs/route.ts`
  - `src/app/api/projects/[id]/approve/route.ts`
  - `src/app/api/projects/[id]/publish/route.ts`
  - `src/app/api/projects/[id]/world/route.ts`
  - `src/app/api/opportunities/route.ts`
  - `src/app/api/opportunities/[id]/proposals/route.ts`
  - `src/app/api/proposals/[id]/accept/route.ts`
  - `src/app/api/uploads/route.ts`
  - `src/app/api/worlds/[id].spz/route.ts`
- `src/app/mcp/route.ts`
  - Endpoint JSON-RPC mínimo com `server/discover`, `initialize`, `tools/list`, `tools/call`, `resources/list` e `resources/read`.
  - Bearer obrigatório, filtro de tools por papel e origem básica.
  - Não usa ainda o SDK MCP oficial nem OAuth/PKCE real.
- `src/app/demo/page.tsx`
  - Fluxo funcional mínimo para cliente e fornecedor, sem acabamento adicional.
  - Pode ser ignorado pelo agente de backend, exceto para manter os contratos das rotas.
- `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`
  - Shell inicial e estilos do demo.

## Próxima ordem obrigatória

1. Fazer a instalação portátil funcionar.
   - Remover a dependência do symlink de `node_modules`.
   - Decidir se a execução volta às versões pinned do plano ou registrar formalmente uma exceção.
   - Gerar e versionar `pnpm-lock.yaml`.
2. Rodar `pnpm build` e corrigir erros de TypeScript/importação antes de adicionar escopo.
3. Criar `supabase/migrations/001_obria.sql` com tabelas, constraints, RLS, buckets privados, revisão, idempotência e audit log append-only.
4. Migrar `demo-store` para um adapter de persistência real ou deixar explicitamente o replay local isolado do caminho Supabase.
5. Implementar `demo:reset`, `demo:record`, `demo:determinism`, `mcp:smoke` e `test` reais. Os scripts ainda não existem apesar de estarem no manifest.
6. Adicionar testes determinísticos para:
   - fórmulas de quantitativos e centavos;
   - transições ilegais e revisão concorrente;
   - isolamento cliente/fornecedor;
   - upload com MIME falso, assinatura inválida e limite de 4 MiB;
   - aceite idempotente/concorrrente;
   - tools MCP filtradas e `403` por papel/scope.
7. Substituir o MCP artesanal pelo SDK oficial do plano (`@modelcontextprotocol/server@2.0.0`) quando as dependências puderem ser instaladas.
8. Implementar OAuth 2.1/JWT assimétrico com Supabase Auth, PKCE, consentimento e metadata. A rota atual não é prova de autenticação de produção.
9. Implementar os contratos reais OpenAI Responses API e World Labs, mantendo `replay` como modo determinístico honesto.
10. Só depois executar o E2E completo e revisar a UI existente.

## Riscos conhecidos

- `src/server/services/obria-service.ts` deve ser compilado imediatamente. A implementação inicial foi escrita rapidamente e pode conter imports/tipos incompatíveis.
- O estado JSON local não tem lock de processo. Não usar como persistência multiusuário.
- O endpoint MCP aceita bearer sintético baseado no header e não valida JWT. Não liberar em produção.
- O asset `.spz` atual é uma sequência mínima de bytes para smoke e não é um splat carregável.
- O endpoint de upload valida tipo, tamanho e assinatura, mas ainda não decodifica/regrava com Sharp nem remove EXIF.
- As credenciais live não estavam presentes no ambiente informado pelo plano.
- O `node_modules` symlinkado para `D:/aumi-cockpit` não deve entrar no git nem ser usado em CI.

## Critério de aceite do handoff

O agente sucessor deve primeiro conseguir executar, em uma instalação limpa:

```powershell
cd D:/obria
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Depois deve provar o roteiro de replay completo: reset, iteração cliente, aprovação, publicação, proposta fornecedor, aceite cliente e refresh mostrando `ACCEPTED`, além de `mcp:smoke` com isolamento por papel.
