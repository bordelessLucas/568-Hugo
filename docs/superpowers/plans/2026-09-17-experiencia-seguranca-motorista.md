# Experiência de segurança para o motorista Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplificar advertências automáticas e entregar SOS local, contatos, pontos seguros avançados, planos explicados e modo feminino sem depender de Blaze ou Twilio.

**Architecture:** `back` concentra prioridade, comandos, protocolo SOS, contatos, planos, filtros e seeds. Mobile implementa canais do aparelho e a experiência principal; web recebe equivalentes seguros onde APIs nativas não existem. Persistência local usa os adaptadores já existentes, mantendo transporte automático atrás de contrato indisponível.

**Tech Stack:** TypeScript 6, Node test runner/tsx, Expo 57, React Native 0.86, React 19, Vite, AsyncStorage, Expo Linking e expo-sms.

**Spec:** `docs/superpowers/specs/2026-09-17-experiencia-seguranca-motorista-design.md`

## Global Constraints

- SOS e alertas críticos permanecem gratuitos.
- Nunca afirmar envio/entrega quando apenas o compositor externo foi aberto.
- Usar `191` para PRF.
- Nenhum segredo Twilio no cliente ou repositório.
- Seeds naturais exibem “Dado simulado para teste” nos detalhes.
- Modo feminino não revela publicamente vulnerabilidade ou viagem solitária.
- Ler `mobile/AGENTS.md` e usar somente APIs compatíveis com Expo 57.

---

### Task 1: Domínio de comandos e priorização de segurança

**Files:**
- Create: `back/src/domain/safety-guidance.ts`
- Create: `back/src/domain/safety-guidance.test.ts`
- Modify: `back/src/index.ts`

**Interfaces:** Produz `SafetyCommand`, `SafetyGuidanceCandidate`, `pickSafetyGuidance` e textos operacionais.

- [ ] Escrever testes falhando para prioridade STOP > risco > atenção > parada, distância e ausência de caminhão.
- [ ] Executar `npm test -- --test-name-pattern="orientação"` e confirmar falha por módulo ausente.
- [ ] Implementar seleção estável de um candidato e comandos `STOP`, `SLOW_DOWN`, `RISK_AHEAD`, `SAFE_STOP`.
- [ ] Executar `npm test` e confirmar aprovação.
- [ ] Commitar com `feat: simplifica orientacoes de seguranca`.

### Task 2: Contatos e protocolo SOS

**Files:**
- Create: `back/src/domain/emergency.ts`
- Create: `back/src/domain/emergency.test.ts`
- Modify: `back/src/index.ts`

**Interfaces:** Produz `TrustedContact`, `EmergencyProtocol`, `createEmergencyProtocol`, `assertTrustedContacts`, `buildEmergencyMessage`, `EmergencyTransportResult`.

- [ ] Escrever testes falhando para máximo três contatos, telefone inválido, protocolo com/sem GPS e mensagem com 191/coordenadas.
- [ ] Executar teste e observar falha esperada.
- [ ] Implementar contratos puros, estados `active/closed` e canais `prepared/handed_to_os/unavailable`.
- [ ] Executar todos os testes e commitar `feat: modela protocolo sos local`.

### Task 3: Seeds e pontos seguros avançados

**Files:**
- Modify: `back/src/domain/safety-fixtures.ts`
- Modify: `back/src/domain/safe-place.ts`
- Modify: `back/src/domain/safe-place.test.ts`
- Modify: `back/src/domain/safety-map.ts`

**Interfaces:** Produz `filterSafePlaces`, `rankSafePlaces` e fixtures sem prefixo visual de demonstração.

- [ ] Escrever testes falhando para busca, serviços, audiência feminina, distância/nota/estrutura e marcação simulada nos detalhes.
- [ ] Executar e confirmar falhas sem alterar expectativas.
- [ ] Adicionar cenários de altura, peso, horário, acidente, roubo e paradas com nomes fictícios naturais.
- [ ] Implementar filtros/ordenação e fonte “Dado simulado para teste”.
- [ ] Executar `npm test` e commitar `feat: amplia cenarios e pontos seguros`.

### Task 4: SOS, contatos e advertência no mobile

**Files:**
- Create: `mobile/src/lib/emergency.ts`
- Create: `mobile/src/components/SosButton.tsx`
- Create: `mobile/src/components/SosConfirmation.tsx`
- Create: `mobile/src/components/SafetyGuidanceCard.tsx`
- Create: `mobile/src/screens/TrustedContactsScreen.tsx`
- Create: `mobile/src/app/contatos-confianca.tsx`
- Modify: `mobile/src/screens/HomeScreen.tsx`
- Modify: `mobile/src/screens/ProfileScreen.tsx`
- Modify: `mobile/package.json`
- Modify: `mobile/package-lock.json`

**Interfaces:** Consome domínio das Tasks 1–2; produz persistência AsyncStorage, ligação `tel:191` e SMS via `expo-sms`.

- [ ] Ler documentação Expo 57 para Linking e SMS; instalar com `npx expo install expo-sms`.
- [ ] Implementar armazenamento local de até três contatos e protocolos.
- [ ] Implementar botão inferior esquerdo, confirmação em dois passos e ações 191/contatos/encerrar.
- [ ] Substituir excesso de informação do alerta por um único `SafetyGuidanceCard` com detalhes expansíveis.
- [ ] Adicionar entrada de contatos no perfil e estados sem GPS/SMS/contatos.
- [ ] Executar `npx tsc --noEmit` e commitar `feat: adiciona sos local e contatos no mobile`.

### Task 5: Pontos seguros, planos e modo feminino

**Files:**
- Modify: `mobile/src/screens/SafePlacesScreen.tsx`
- Modify: `mobile/src/screens/SettingsScreen.tsx`
- Modify: `mobile/src/lib/settings.ts`
- Modify: `mobile/src/contexts/SettingsContext.tsx`
- Modify: `web/src/screens/SafePlacesScreen.tsx`
- Modify: `web/src/screens/SettingsScreen.tsx`
- Modify: `web/src/lib/settings.ts`
- Modify: `web/src/contexts/SettingsContext.tsx`

**Interfaces:** Consome filtros/planos compartilhados; produz busca, chips de filtros, detalhes, comparação de planos e preferência feminina privada.

- [ ] Implementar busca, filtros e ordenação dos pontos no mobile e web.
- [ ] Adicionar detalhe com motivos, funcionamento, verificação e ações habilitadas conforme dados.
- [ ] Modelar catálogo Gratuito/Premium/Frotas com recursos `available/planned` e sem preço/cobrança.
- [ ] Adicionar toggle privado de modo feminino e filtros de estrutura; incluir atalhos de pânico/denúncia/comunidade no mobile.
- [ ] Executar TypeScript mobile e build web; commitar `feat: completa seguranca pontos e planos`.

### Task 6: Revisão, documentação e validação

**Files:**
- Modify: `docs-ia/avisos-rota.md`
- Modify: `docs-ia/restricoes-pontos-seguros.md`
- Modify: `docs-ia/escopo.md`
- Modify: `docs-ia/relatorio-implementacao-incidentes-seguranca.md`

**Interfaces:** Documenta limites locais e ativação futura do transporte automático.

- [ ] Revisar visualmente hierarquia, contraste, alvos, textos e ausência de SOS nas advertências.
- [ ] Revisar privacidade, afirmações de envio, seeds e segurança gratuita.
- [ ] Corrigir todos os achados relacionados.
- [ ] Executar `npm test` em back, `npx tsc --noEmit` em mobile, `npm run build` em web e `git diff --check`.
- [ ] Atualizar documentos e commitar `docs: registra experiencia de seguranca`.
- [ ] Confirmar `git status --short` limpo.
