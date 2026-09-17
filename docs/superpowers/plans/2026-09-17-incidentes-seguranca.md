# Incidentes de Segurança Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir relatos estruturados de condição da via, acidente, bloqueio, risco de roubo e local inseguro no mobile e no web, integrados ao Firestore, feed comunitário e avisos de rota.

**Architecture:** O pacote `back` continua sendo a fonte única dos tipos, normalização, validação e textos de domínio. Firestore persiste `category` nos novos documentos e mantém leitura compatível com registros legados; mobile e web apenas controlam formulário e apresentação. O algoritmo existente de relevância e confirmação de alertas não muda.

**Tech Stack:** TypeScript, React 19, React Native/Expo 57, Firebase Firestore, Node `node:test` com `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-17-incidentes-seguranca-design.md`

## Global Constraints

- Preservar `status: 'passa' | 'nao_passa'` como núcleo de passabilidade em todas as categorias.
- Categorias persistidas: `route_condition`, `accident`, `road_block`, `robbery_risk`, `unsafe_place`.
- Documento legado sem categoria deve ser lido como `route_condition`.
- Descrição mínima de oito caracteres para categorias de segurança e qualquer urgência extrema.
- Não enviar localização a autoridades ou terceiros e não apresentar relatos como fonte oficial.
- Remover os seeds incorretamente atribuídos a Barra Velha; manter somente demonstrações explicitamente simuladas.
- Não implementar SOS, KYC, pontos seguros, modo feminino ou monetização neste plano.

---

### Task 1: Domínio e testes de categoria

**Files:**
- Modify: `back/package.json`
- Modify: `back/src/domain/report.ts`
- Modify: `back/src/index.ts`
- Create: `back/src/domain/report.test.ts`

**Interfaces:**
- Produces: `ReportCategory`, `REPORT_CATEGORIES`, `REPORT_CATEGORY_OPTIONS`, `isReportCategory(value)`, `normalizeReportCategory(value)`, `reportCategoryRequiresNotes(category)`, `assertReportDraft(report)` e `formatReportLabel(category, status)`.
- `Report` e `NewReport` passam a carregar `category: ReportCategory`.

- [ ] **Step 1: Adicionar o executor de testes**

Adicionar a `back/package.json`:

```json
"scripts": { "test": "tsx --test src/**/*.test.ts" },
"devDependencies": { "tsx": "^4.20.6", "typescript": "~6.0.3" }
```

Executar `npm install --prefix back` para atualizar somente `back/package-lock.json`.

- [ ] **Step 2: Escrever os testes que falham**

Criar `report.test.ts` cobrindo:

```ts
assert.equal(normalizeReportCategory(undefined), 'route_condition')
assert.equal(normalizeReportCategory('unknown'), 'route_condition')
assert.equal(formatReportLabel('accident', 'nao_passa'), 'Acidente: não passa')
assert.equal(formatReportLabel('road_block', 'passa'), 'Bloqueio: passa com atenção')
assert.throws(() => assertReportDraft(securityDraft({ notes: 'curta' })), /pelo menos 8/)
assert.doesNotThrow(() => assertReportDraft(routeDraft({ notes: '' })))
assert.throws(() => assertReportDraft(routeDraft({ urgency: 'extreme', notes: '' })), /pelo menos 8/)
```

- [ ] **Step 3: Confirmar a falha específica**

Executar `npm test --prefix back`.

Resultado esperado: falha de importação porque as novas APIs ainda não existem.

- [ ] **Step 4: Implementar o domínio mínimo**

Em `report.ts`, criar os cinco valores, opções compartilhadas com `label` e `description`, normalização legada, regra de descrição, formatação de rótulo e `assertReportDraft`. A validação deve checar categoria, status, urgência, caminhão, coordenadas, limite de 500 caracteres e descrição mínima.

Exportar todas as APIs novas em `back/src/index.ts`.

- [ ] **Step 5: Executar teste e compilação**

Executar:

```bash
npm test --prefix back
npx tsc --noEmit --project mobile/tsconfig.json
```

Resultado esperado: todos os testes e a compilação do consumidor mobile passam.

- [ ] **Step 6: Commit**

```bash
git add back/package.json back/package-lock.json back/src/domain/report.ts back/src/domain/report.test.ts back/src/index.ts
git commit -m "feat: modela categorias de incidentes"
```

### Task 2: Persistência, regras e compatibilidade legada

**Files:**
- Modify: `back/src/services/database.service.ts`
- Modify: `back/firestore.rules`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes: `normalizeReportCategory`, `assertReportDraft`, `NewReport.category`.
- Produces: novos documentos `reports` com `category`; documentos antigos continuam parseáveis.

- [ ] **Step 1: Estender o teste de domínio para o contrato de normalização**

Adicionar casos para cada categoria aceita e garantir que string desconhecida normalize para `route_condition` somente na leitura.

- [ ] **Step 2: Centralizar validação e persistir categoria**

Em `createReport`, substituir validações duplicadas por `assertReportDraft(report)` e incluir:

```ts
category: report.category,
```

Em `parseReport`, incluir:

```ts
category: normalizeReportCategory(record.category),
```

- [ ] **Step 3: Atualizar regras nas duas cópias do Firestore**

Adicionar `category` a `hasOnly` e exigir:

```text
request.resource.data.category in [
  'route_condition', 'accident', 'road_block', 'robbery_risk', 'unsafe_place'
]
```

Preservar as demais restrições e a proibição de update/delete.

- [ ] **Step 4: Verificar contrato**

Executar:

```bash
npm test --prefix back
npx tsc --noEmit --project mobile/tsconfig.json
```

Usar `rg -n "category" back/firestore.rules firestore.rules back/src/services/database.service.ts` para confirmar que escrita e regras usam os mesmos valores.

- [ ] **Step 5: Commit**

```bash
git add back/src/services/database.service.ts back/firestore.rules firestore.rules back/src/domain/report.test.ts
git commit -m "feat: persiste categoria dos incidentes"
```

### Task 3: Feed, alertas e dados piloto

**Files:**
- Modify: `back/src/domain/community.ts`
- Modify: `back/src/domain/route-alert.ts`
- Modify: `back/src/services/route-alert.service.ts`
- Modify: `back/src/domain/report.test.ts`

**Interfaces:**
- Consumes: `ReportCategory`, `formatReportLabel`.
- Produces: `PilotMark.category`, `CommunityFeedItem.category`, `RouteAlertSource.category` e textos consistentes.

- [ ] **Step 1: Escrever testes de rótulo e seeds**

Cobrir que:

```ts
assert.ok(!PILOT_MARKS.some((mark) => /SC-401|4,5 m|DNIT/.test(mark.label + mark.notes + mark.source)))
assert.ok(PILOT_MARKS.every((mark) => mark.category))
```

- [ ] **Step 2: Fazer categoria atravessar feed e alerta**

Adicionar `category` aos tipos `PilotMark`, `CommunityFeedItem` e `RouteAlertSource`. Em `buildCommunityFeed` e `listRouteAlertSources`, copiar a categoria e usar `formatReportLabel(category, status)`.

- [ ] **Step 3: Corrigir os seeds**

Remover `pilot-br101-viaduto` e `pilot-sc401-pico`. Manter o acidente apenas como demonstração, com `category: 'accident'` e fonte textual “Demonstração RotaTrucks — dado simulado”. Marcar os demais pins como `route_condition`.

- [ ] **Step 4: Verificar regressão do domínio**

Executar `npm test --prefix back` e `npx tsc --noEmit --project mobile/tsconfig.json`.

- [ ] **Step 5: Commit**

```bash
git add back/src/domain/community.ts back/src/domain/route-alert.ts back/src/services/route-alert.service.ts back/src/domain/report.test.ts
git commit -m "feat: integra categorias aos alertas e feed"
```

### Task 4: Formulário mobile e apresentação

**Files:**
- Modify: `mobile/src/screens/ReportScreen.tsx`
- Modify: `mobile/src/components/RouteAlertCard.tsx`
- Modify: `mobile/src/screens/CommunityScreen.tsx`

**Interfaces:**
- Consumes: `REPORT_CATEGORIES`, `REPORT_CATEGORY_OPTIONS`, `ReportCategory`, `reportCategoryRequiresNotes`, `formatReportLabel` e `createReport`.
- Produces: formulário mobile com categoria obrigatória e alertas/feed com categoria visível.

- [ ] **Step 1: Adicionar estado e seletor de categoria**

Inicializar `category` como `route_condition` e renderizar escolhas antes do caminhão. Cada opção usa `label` e `description` compartilhados.

- [ ] **Step 2: Aplicar cópia e validação por categoria**

Trocar “Situação” por “Dá para seguir com o caminhão?”. Exigir oito caracteres nas categorias de segurança ou urgência extrema e passar `category` a `createReport`.

Adicionar aviso: “Urgência extrema não substitui polícia ou atendimento de emergência.”

- [ ] **Step 3: Exibir categoria nos consumidores**

No cartão, incluir o rótulo da categoria na linha de metadados. No feed, manter `item.label`, agora produzido pelo domínio, sem duplicar regras de texto na tela.

- [ ] **Step 4: Compilar o mobile**

Executar `npx tsc --noEmit --project mobile/tsconfig.json`.

Resultado esperado: zero erros, inclusive em todos os novos campos obrigatórios.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/ReportScreen.tsx mobile/src/components/RouteAlertCard.tsx mobile/src/screens/CommunityScreen.tsx
git commit -m "feat: adiciona incidentes estruturados no mobile"
```

### Task 5: Formulário web e verificação integrada

**Files:**
- Modify: `web/src/screens/ReportScreen.tsx`
- Modify: `web/src/screens/CommunityScreen.tsx`
- Modify: `docs-ia/avisos-rota.md`
- Modify: `docs-ia/escopo.md`

**Interfaces:**
- Consumes: as mesmas APIs compartilhadas do Task 4.
- Produces: paridade funcional web/mobile e documentação atualizada.

- [ ] **Step 1: Adicionar categoria e urgência ao web**

Adicionar seletor de categoria, estado `extreme`, texto “Dá para seguir com o caminhão?”, validação de descrição e `category`/`urgency` no payload.

- [ ] **Step 2: Confirmar apresentação no feed web**

Usar o rótulo já produzido por `CommunityFeedItem.label` e mostrar `REPORT_CATEGORY_OPTIONS[item.category].label` como metadado, sem reconstruir o texto.

- [ ] **Step 3: Atualizar guias ativos**

Registrar em `avisos-rota.md` as cinco categorias e a compatibilidade legada. Em `escopo.md`, acrescentar “incidentes de segurança estruturados” à lista implementada e manter SOS/monetização fora do corte.

- [ ] **Step 4: Executar verificação completa**

Executar:

```bash
npm test --prefix back
npx tsc --noEmit --project mobile/tsconfig.json
npm run build --prefix web
git diff --check
```

Resultado esperado: testes verdes, três projetos compilando e nenhum erro de whitespace.

- [ ] **Step 5: Inspecionar o diff e confirmar escopo**

Executar `git diff --stat` e `git status --short`. Confirmar que `mobile/App.tsx` e `.cursor/` permanecem fora dos commits deste incremento.

- [ ] **Step 6: Commit**

```bash
git add web/src/screens/ReportScreen.tsx web/src/screens/CommunityScreen.tsx docs-ia/avisos-rota.md docs-ia/escopo.md
git commit -m "feat: completa incidentes estruturados no web"
```
