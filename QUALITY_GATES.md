# Gates de Qualidade e Avaliação

**Status:** obrigatório  
**Aplicação:** planejamento, auditoria de pull requests, release candidate, deploy, demonstração e perguntas e respostas.

Nenhuma funcionalidade pode ser apresentada como concluída sem evidência observável. Cada entrega deve ser avaliada pelos critérios abaixo e registrar a evidência usada para sustentar a nota. Os itens classificados entre **1 e 3** bloqueiam a entrega; itens entre **4 e 6** exigem correção ou aceitação explícita do risco antes do deploy.

## Rodada 1

Os participantes serão divididos em grupos de avaliação, distribuídos por diferentes salas do local. Cada equipe terá aproximadamente **3 minutos para fazer uma demonstração ao vivo do projeto**, seguidos de **1 a 2 minutos de perguntas e respostas**.

### Critérios de avaliação

- **Versão Funcional — /10**  
  O projeto demonstrou sua funcionalidade principal funcionando de ponta a ponta?
- **Execução de Engenharia — /10**  
  A implementação é coerente, robusta e tecnicamente apropriada para o objetivo do projeto?
- **Ambição Técnica — /10**  
  Quão ambicioso e tecnicamente desafiador é o objetivo do projeto?
- **Inovação — /10**  
  O projeto introduz uma abordagem inovadora ou melhora significativamente as soluções existentes?
- **Utilidade e Clareza — /10**  
  O caso de uso do projeto é claro e a versão desenvolvida demonstra valor significativo para seus usuários pretendidos?

### Âncoras de pontuação

- **1–3:** não atendido ou demonstrado de forma insuficiente
- **4–6:** parcialmente atendido, com lacunas significativas
- **7–8:** substancialmente atendido, com lacunas menores
- **9–10:** totalmente atendido, com evidências claras e consistentes

## Rodada 2

As **cinco melhores equipes** apresentarão seus projetos no palco para um painel de jurados e todos os participantes. Cada equipe terá aproximadamente **3 minutos para fazer uma demonstração ao vivo**, seguidos de **1 a 2 minutos de perguntas e respostas**.

### Critérios de avaliação

- **Cumprimento do Objetivo — /10**  
  O projeto cumpre o propósito ou objetivo declarado pela equipe?
- **Confiabilidade Funcional — /10**  
  A funcionalidade principal funcionou de ponta a ponta durante a demonstração final, sem falhas críticas?
- **Execução de Engenharia — /10**  
  A implementação é coerente, robusta e apropriada para o objetivo declarado do projeto?
- **Qualidade Técnica — /10**  
  O projeto demonstra profundidade técnica, escolhas técnicas sólidas e dificuldade de implementação significativa?
- **Inovação — /10**  
  O projeto aplica uma abordagem inovadora ou melhora significativamente uma abordagem existente?
- **Originalidade — /10**  
  O conceito ou a implementação é claramente distinto das soluções comumente disponíveis?
- **Evidência de Versão Funcional — /10**  
  A demonstração final mostrou claramente a versão funcional e as funcionalidades reivindicadas pela equipe?
- **Utilidade e Clareza — /10**  
  O caso de uso é claro, relevante e fácil de entender a partir das evidências apresentadas?
- **Clareza da Apresentação — /10**  
  A apresentação final foi clara, bem estruturada, compreensível para o público e concluída dentro do tempo estabelecido?
- **Desempenho ao Vivo e Perguntas e Respostas — /10**  
  A equipe demonstrou domínio do projeto, apresentando de forma eficaz e respondendo às perguntas dos jurados com precisão e objetividade?

### Âncoras de pontuação

- **1–3:** não atendido ou demonstrado de forma insuficiente
- **4–6:** parcialmente atendido, com lacunas significativas
- **7–8:** substancialmente atendido, com lacunas menores
- **9–10:** totalmente atendido, com evidências claras e consistentes

## Evidência obrigatória de release

Antes de integrar em `main` ou publicar no Vercel, a auditoria deve registrar:

- commit ou pull request avaliado;
- build e testes executados;
- fluxo ponta a ponta realmente exercitado;
- URL e ambiente usados na demonstração;
- funcionalidades reais, demonstrativas e indisponíveis claramente separadas;
- falhas conhecidas e plano de contingência da apresentação;
- notas provisórias de cada critério, acompanhadas de evidência.
