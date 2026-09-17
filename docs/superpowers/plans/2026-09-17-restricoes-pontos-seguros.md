# Restrições oficiais e pontos seguros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir restrições viárias curadas e pontos seguros no RotaTrucks, avaliando regras contra o caminhão e preservando a distinção entre fonte verificada, demonstração e relato comunitário.

**Architecture:** O pacote `back` define contratos, validação, fixtures, avaliação temporal/dimensional e acesso ao Firestore. Web e mobile consomem o mesmo domínio para montar camadas do mapa e cartões de detalhes; as coleções curadas são somente leitura para clientes. O incremento não recalcula rotas, não recebe avaliações públicas e não promete cobertura oficial nacional.

**Tech Stack:** TypeScript 6, Node test runner via `tsx`, Firebase/Firestore, React 19 + Vite, Expo 57 + React Native 0.86, MapLibre no web.

**Spec:** `docs/superpowers/specs/2026-09-17-restricoes-pontos-seguros-design.md`

## Global Constraints

- Ler `mobile/AGENTS.md` e a documentação exata do Expo 57 antes de alterar código mobile.
- Não usar como seed os exemplos incorretos de SC-401/Barra Velha ou viaduto de 4,5 m/Barra Velha.
- Dados demonstrativos devem exibir “Demonstração”; somente registros com fonte primária conferida podem usar `verified`.
- `officialRestrictions` e `safePlaces` são somente leitura para clientes no Firestore.
- Datas e horários de restrições usam `America/Sao_Paulo` neste incremento.
- Pontos seguros não são garantia de segurança; mostrar data de verificação e aviso de mudança de condições.
- Sem novas dependências de produção.

---

### Task 1: Domínio de restrições e avaliação de compatibilidade

**Files:**
- Create: `back/src/domain/official-restriction.ts`
- Create: `back/src/domain/official-restriction.test.ts`
- Modify: `back/src/index.ts`

**Interfaces:**
- Consumes: `Truck`, `TruckType` de `back/src/domain/truck.ts`.
- Produces: `OfficialRestriction`, `RestrictionEvaluation`, `assertOfficialRestriction`, `evaluateOfficialRestriction`, `formatRestrictionReason`.

- [ ] **Step 1: Escrever testes falhando para validação, dimensões e tipo**

Criar fixtures locais e cobrir: altura acima do máximo retorna `blocked`; peso dentro do máximo retorna `not_applicable`; tipo atingido retorna o efeito configurado; registro `verified` sem URL HTTPS falha; regra sem limite nem tipo falha.

```ts
const result = evaluateOfficialRestriction(restriction, truck, new Date('2026-09-17T15:00:00-03:00'))
assert.equal(result.status, 'blocked')
assert.match(result.reasons.join(' '), /altura/i)
```

- [ ] **Step 2: Executar o teste e confirmar falha**

Run: `npm test -- --test-name-pattern="restrição"`
Expected: FAIL porque o módulo ainda não existe.

- [ ] **Step 3: Implementar contratos e validação**

Definir exatamente:

```ts
export type RestrictionSourceStatus = 'verified' | 'demo' | 'expired'
export type RestrictionEffect = 'warning' | 'blocked'
export interface RestrictionTimeWindow { start: string; end: string }
export interface RestrictionLimits {
  maxHeightMeters?: number
  maxWidthMeters?: number
  maxLengthMeters?: number
  maxWeightKg?: number
}
export interface OfficialRestriction {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  authority?: string
  sourceUrl?: string
  sourceStatus: RestrictionSourceStatus
  verifiedAt?: string
  validFrom?: string
  validUntil?: string
  weekdays?: number[]
  timeWindows?: RestrictionTimeWindow[]
  timezone: 'America/Sao_Paulo'
  limits: RestrictionLimits
  affectedTruckTypes: TruckType[]
  effect: RestrictionEffect
}
export type RestrictionEvaluationStatus = 'not_applicable' | 'warning' | 'blocked'
export interface RestrictionEvaluation {
  status: RestrictionEvaluationStatus
  reasons: string[]
}
```

Validar coordenadas, strings, ISO date, horários `HH:mm`, dias 0–6, números positivos, fonte verificada e existência de ao menos um limite ou tipo afetado.

- [ ] **Step 4: Implementar avaliação temporal e dimensional**

`evaluateOfficialRestriction(restriction, truck, at)` primeiro elimina registros expirados/fora de vigência, dia ou janela. Depois compara cada dimensão com o máximo e verifica tipo. Janelas com `start > end` abrangem a meia-noite. Retornar razões humanas, sem incluir critérios que não atingem o caminhão.

- [ ] **Step 5: Executar todos os testes backend**

Run: `npm test`
Expected: PASS, incluindo testes anteriores.

- [ ] **Step 6: Exportar API e commitar**

```bash
git add back/src/domain/official-restriction.ts back/src/domain/official-restriction.test.ts back/src/index.ts
git commit -m "feat: avalia restricoes oficiais"
```

---

### Task 2: Domínio de pontos seguros

**Files:**
- Create: `back/src/domain/safe-place.ts`
- Create: `back/src/domain/safe-place.test.ts`
- Modify: `back/src/index.ts`

**Interfaces:**
- Consumes: `GeoPoint` e `haversineMeters` de `back/src/domain/route-alert.ts`.
- Produces: `SafePlace`, `SafePlaceService`, `assertSafePlace`, `hasWomenFriendlySeal`, `sortSafePlacesByDistance`.

- [ ] **Step 1: Escrever testes falhando para selo, validação e distância**

Cobrir selo somente com `restroom`, `shower`, `lighting`, `security`; registro curado exige `verifiedAt`; nota deve estar entre 0 e 5; contagem não pode ser negativa; ordenação deve preservar entrada quando não houver localização.

```ts
assert.equal(hasWomenFriendlySeal(placeWithRequiredServices), true)
assert.deepEqual(sortSafePlacesByDistance([far, near], origin).map((item) => item.id), ['near', 'far'])
```

- [ ] **Step 2: Executar o teste e confirmar falha**

Run: `npm test -- --test-name-pattern="ponto seguro"`
Expected: FAIL porque o módulo ainda não existe.

- [ ] **Step 3: Implementar contrato e regras**

```ts
export const SAFE_PLACE_SERVICES = [
  'truck_parking', 'lighting', 'security', 'restroom',
  'shower', 'food', 'repair', 'overnight',
] as const
export type SafePlaceService = (typeof SAFE_PLACE_SERVICES)[number]
export interface SafePlace {
  id: string
  name: string
  category: 'truck_stop' | 'gas_station' | 'restaurant' | 'service_area'
  latitude: number
  longitude: number
  address?: string
  openingHours?: string
  services: SafePlaceService[]
  audience: 'all' | 'women_recommended'
  origin: 'curated' | 'demo'
  verifiedAt?: string
  ratingAverage: number
  ratingCount: number
}
```

`hasWomenFriendlySeal` exige origem curada, audiência `women_recommended`, `verifiedAt` válido e os quatro serviços mínimos. `sortSafePlacesByDistance(places, origin)` retorna cópia ordenada; `origin === null` mantém a ordem.

- [ ] **Step 4: Executar todos os testes backend**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Exportar API e commitar**

```bash
git add back/src/domain/safe-place.ts back/src/domain/safe-place.test.ts back/src/index.ts
git commit -m "feat: modela pontos seguros"
```

---

### Task 3: Fixtures curadas, parsing e Firestore somente leitura

**Files:**
- Create: `back/src/domain/safety-fixtures.ts`
- Create: `back/src/services/safety.service.ts`
- Create: `back/src/services/safety.service.test.ts`
- Modify: `back/src/index.ts`
- Modify: `back/firestore.rules`

**Interfaces:**
- Consumes: tipos e asserts das Tasks 1–2; `getFirestoreDb`.
- Produces: `DEMO_OFFICIAL_RESTRICTIONS`, `DEMO_SAFE_PLACES`, `listOfficialRestrictions`, `listSafePlaces`.

- [ ] **Step 1: Escrever testes falhando para fixtures e parsers**

Testar que todos os fixtures passam nos asserts, todos usam `demo`, nenhum contém `SC-401`, `4,5 m` ou `DNIT`, documentos inválidos são descartados e documentos válidos são normalizados.

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm test -- --test-name-pattern="dados de segurança"`
Expected: FAIL porque serviço/fixtures não existem.

- [ ] **Step 3: Criar fixtures demonstrativas de Barra Velha**

Criar ao menos uma restrição dimensional e dois pontos seguros fictícios com nomes iniciados por “Demonstração”. Não usar nome de estabelecimento real nem atribuir órgão público.

- [ ] **Step 4: Implementar parsing resiliente e consultas**

Em `safety.service.ts`, criar parsers internos que constroem o objeto, chamam o assert e retornam `null` no documento inválido. As funções consultam as coleções e retornam somente itens válidos; se o Firebase não estiver configurado, seguem o padrão de fixture existente do projeto e retornam fixtures demo.

```ts
export async function listOfficialRestrictions(): Promise<OfficialRestriction[]>
export async function listSafePlaces(): Promise<SafePlace[]>
```

- [ ] **Step 5: Bloquear escrita nas regras**

Adicionar regras explícitas:

```text
match /officialRestrictions/{restrictionId} {
  allow read: if true;
  allow create, update, delete: if false;
}
match /safePlaces/{placeId} {
  allow read: if true;
  allow create, update, delete: if false;
}
```

- [ ] **Step 6: Rodar testes e checagem de whitespace**

Run: `npm test` em `back`; depois `git diff --check`.
Expected: PASS e nenhuma saída do diff check.

- [ ] **Step 7: Exportar API e commitar**

```bash
git add back/src/domain/safety-fixtures.ts back/src/services/safety.service.ts back/src/services/safety.service.test.ts back/src/index.ts back/firestore.rules
git commit -m "feat: adiciona base curada de seguranca"
```

---

### Task 4: Modelo unificado de pins e detalhes

**Files:**
- Create: `back/src/domain/safety-map.ts`
- Create: `back/src/domain/safety-map.test.ts`
- Modify: `back/src/index.ts`

**Interfaces:**
- Consumes: `OfficialRestriction`, `RestrictionEvaluation`, `SafePlace`, `Truck`.
- Produces: `SafetyMapMark`, `buildRestrictionMark`, `buildSafePlaceMark`, `formatSafePlaceServices`, `SAFETY_SOURCE_LABELS`.

- [ ] **Step 1: Escrever testes falhando para apresentação compartilhada**

Cobrir: pin de restrição inclui `blocked/warning/not_applicable`; fonte demo recebe “Demonstração”; selo só aparece conforme domínio; serviços saem em ordem estável e em português.

- [ ] **Step 2: Executar e confirmar falha**

Run: `npm test -- --test-name-pattern="mapa de segurança"`
Expected: FAIL porque funções ainda não existem.

- [ ] **Step 3: Implementar view model compartilhado**

```ts
export interface SafetyMapMark {
  id: string
  kind: 'restriction' | 'safe_place'
  latitude: number
  longitude: number
  title: string
  badge: string
  tone: 'danger' | 'warning' | 'safe' | 'neutral'
  details: string[]
  sourceLabel: string
}
```

Nunca concatenar rótulos de forma duplicada. Para caminhão ausente, restrição usa tom neutro e badge “Verifique seu caminhão”.

- [ ] **Step 4: Rodar testes e commitar**

Run: `npm test`
Expected: PASS.

```bash
git add back/src/domain/safety-map.ts back/src/domain/safety-map.test.ts back/src/index.ts
git commit -m "feat: prepara camadas de seguranca do mapa"
```

---

### Task 5: Integrar restrições e pontos seguros no mobile

**Files:**
- Modify: `mobile/src/screens/HomeScreen.tsx`
- Modify: `mobile/src/components/MockMap.tsx`
- Create: `mobile/src/components/SafetyDetailCard.tsx`
- Create: `mobile/src/screens/SafePlacesScreen.tsx`
- Create: `mobile/src/app/(tabs)/pontos-seguros.tsx`
- Modify: `mobile/src/app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: `listOfficialRestrictions`, `listSafePlaces`, `evaluateOfficialRestriction`, builders da Task 4 e caminhão/localização dos contextos existentes.
- Produces: filtros de camadas, seleção de pin e lista de pontos seguros no Expo Router.

- [ ] **Step 1: Confirmar documentação e padrões locais**

Ler `mobile/AGENTS.md`, Expo Router tabs v57 e os componentes existentes. Não instalar biblioteca de mapa ou estado.

- [ ] **Step 2: Carregar dados e construir pins na Home**

Adicionar estados `loading/error`, filtros `showRestrictions/showSafePlaces` e `selectedSafetyMark`. Avaliar cada restrição com o caminhão atual e mesclar somente para apresentação, mantendo relatos comunitários separados.

- [ ] **Step 3: Estender `MockMap` sem quebrar pins existentes**

Aceitar `safetyMarks?: SafetyMapMark[]` e `onSafetyMarkPress?: (mark) => void`. Usar símbolos/cores distintos: bloqueio vermelho, alerta âmbar e ponto seguro verde. Manter `marks` comunitários inalterados.

- [ ] **Step 4: Criar cartão acessível de detalhes**

`SafetyDetailCard` mostra badge, título, detalhes e fonte; para ponto seguro inclui serviços/nota/verificação e o aviso “As condições podem mudar. Confirme antes de parar.” Botão de fechar deve ter label acessível.

- [ ] **Step 5: Criar aba/lista de pontos seguros**

Ordenar por distância quando disponível, mostrar estados de carregamento/vazio/erro, nota com quantidade e selo. Sem localização, preservar ordem e explicar que distância não está disponível.

- [ ] **Step 6: Verificar mobile**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commitar**

```bash
git add mobile/src/screens/HomeScreen.tsx mobile/src/components/MockMap.tsx mobile/src/components/SafetyDetailCard.tsx mobile/src/screens/SafePlacesScreen.tsx 'mobile/src/app/(tabs)/pontos-seguros.tsx' 'mobile/src/app/(tabs)/_layout.tsx'
git commit -m "feat: exibe seguranca curada no mobile"
```

---

### Task 6: Integrar restrições e pontos seguros no web

**Files:**
- Modify: `web/src/screens/HomeScreen.tsx`
- Modify: `web/src/components/RouteMap.tsx`
- Create: `web/src/components/SafetyDetailCard.tsx`
- Create: `web/src/screens/SafePlacesScreen.tsx`
- Modify: `web/src/App.tsx`
- Modify: `web/src/components/AppFrame.tsx`
- Modify: `web/src/index.css`

**Interfaces:**
- Consumes: as mesmas APIs compartilhadas da Task 5.
- Produces: camadas MapLibre, detalhes e rota `/pontos-seguros`.

- [ ] **Step 1: Carregar e filtrar dados na Home web**

Repetir a semântica do mobile usando o domínio compartilhado. Não duplicar avaliação ou textos de serviços no frontend.

- [ ] **Step 2: Adicionar fontes/camadas MapLibre**

Converter `SafetyMapMark` em GeoJSON separado dos relatos. Criar camada de restrições e camada de pontos seguros, registrar clique e remover listeners/layers/sources no cleanup. Não recriar o mapa a cada filtro.

- [ ] **Step 3: Criar cartão de detalhes e controles**

Usar os mesmos badges e avisos do mobile, com botão focável e navegação por teclado. Controles de camada devem ter estado visível e `aria-pressed`.

- [ ] **Step 4: Criar tela e navegação de pontos seguros**

Adicionar `/pontos-seguros`, item no `AppFrame` e lista responsiva ordenada por distância, com estados de carregamento/vazio/erro.

- [ ] **Step 5: Verificar web**

Run: `npm run build`
Expected: TypeScript e Vite aprovados; aviso existente de chunk pode permanecer.

- [ ] **Step 6: Commitar**

```bash
git add web/src/screens/HomeScreen.tsx web/src/components/RouteMap.tsx web/src/components/SafetyDetailCard.tsx web/src/screens/SafePlacesScreen.tsx web/src/App.tsx web/src/components/AppFrame.tsx web/src/index.css
git commit -m "feat: exibe seguranca curada no web"
```

---

### Task 7: Documentação, revisão e validação integral

**Files:**
- Create: `docs-ia/restricoes-pontos-seguros.md`
- Modify: `docs-ia/escopo.md`
- Modify: `docs-ia/here-checklist.md`
- Modify: `docs-ia/relatorio-implementacao-incidentes-seguranca.md`

**Interfaces:**
- Consumes: comportamento final das Tasks 1–6.
- Produces: documentação operacional e evidências reproduzíveis.

- [ ] **Step 1: Documentar contratos e limitações**

Registrar coleções, campos, estados de fonte, regras de compatibilidade, selo, fixtures demo e procedimento manual para validar fonte. Declarar explicitamente: sem ingestão automática, sem garantia de segurança e sem recálculo automático.

- [ ] **Step 2: Atualizar escopo e checklist**

Marcar restrições curadas e pontos seguros de leitura como implementados. Manter avaliações públicas, modo feminino completo, SOS e monetização na lista pendente.

- [ ] **Step 3: Fazer code review do diff contra a especificação**

Revisar separação entre fontes, consistência de tipos, validação temporal, listeners MapLibre, estados de erro, acessibilidade e escrita negada. Corrigir todos os achados relacionados antes de seguir.

- [ ] **Step 4: Executar validação completa**

Run:

```bash
cd back && npm test
cd ../mobile && npx tsc --noEmit
cd ../web && npm run build
cd .. && git diff --check main...HEAD
```

Expected: testes, TypeScript, build e diff check aprovados. Registrar separadamente limitações de lint preexistentes.

- [ ] **Step 5: Verificar estado e commitar documentação**

```bash
git status --short
git add docs-ia/restricoes-pontos-seguros.md docs-ia/escopo.md docs-ia/here-checklist.md docs-ia/relatorio-implementacao-incidentes-seguranca.md
git commit -m "docs: registra restricoes e pontos seguros"
```

- [ ] **Step 6: Confirmar branch limpa**

Run: `git status --short`
Expected: nenhuma saída.
