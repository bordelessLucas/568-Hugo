# Avisos na rota (estilo Waze) — MVP mobile

Público: caminhoneiro no mapa, em movimento. Linguagem simples. Sempre dá para fechar.

## Objetivo

Avisar na tela quando houver observação / advertência relevante no trajeto, e depois de passar pelo ponto perguntar **“Continua lá?”**.

## Regras aprovadas

| Situação | Comportamento |
|---|---|
| Com destino | Avisos no corredor (~2,5 km de metade) à frente; após ~400 m além do ponto → “Continua lá?” |
| Sem destino | **Somente urgência extrema** (acidente grave / risco imediato) perto (~1,5 km) |
| “Não, liberou” | Baixa a prioridade do aviso |
| Esconder aviso | ≥ **80%** de respostas “liberou” **e** amostra mínima de **5** votos úteis |
| Tempo para sumir sozinho | Constante `ROUTE_ALERT` (ajustável depois) + auto-dismiss do cartão de confirmação (~90 s) |
| Plataforma MVP | **Mobile** primeiro (web depois) |

Votos úteis = `continues` + `cleared`. “Não sei / Depois” não entra na amostra.

## Fluxos

```
Home (GPS ok)
 ├─ Sem destino
 │    └─ Urgência extrema perto → cartão → Entendi / Fechar
 └─ Com destino (origem fixa no momento da escolha)
      ├─ Aviso no corredor à frente → Entendi / Fechar
      └─ Passou do ponto → Continua lá?
           ├─ Sim, continua
           ├─ Não, liberou  (↓ prioridade; pode esconder com 80% + min 5)
           └─ Não sei / Depois  (fecha; não pergunta de novo neste trajeto)
```

## Back (implementado)

| Função / peça | Papel |
|---|---|
| `domain/route-alert.ts` | Corredor, pick do cartão, votos, labels |
| `Report.urgency` | `normal` \| `extreme` |
| `listRouteAlertSources` | Pilot marks + ocorrências recentes |
| `loadRouteAlertForTrip` | Monta o próximo cartão |
| `submitAlertConfirmation` | Grava voto (1 útil por usuário/aviso) + atualiza `alertStats` |
| Coleções | `alertStats`, `alertConfirmations` |
| Firestore rules | create report com urgency; stats/confirmações autenticados |

## Front mobile (implementado)

- Cartão `RouteAlertCard` na Home (**embaixo do mapa**, com scroll)
- Hook `useRouteAlerts` (poll ~4 s, seen / confirm / cooldown)
- Destaque no `MockMap` quando o aviso ativo é marca piloto
- Ocorrência: toggle **Urgência extrema** (observação obrigatória)
- Chip “Só urgência extrema” quando não há destino
- Limpar destino no X da busca (sai do modo rota)

## Categorias de ocorrência (implementado)

- Condição da via (`route_condition`)
- Acidente (`accident`)
- Bloqueio (`road_block`)
- Risco de roubo (`robbery_risk`)
- Local inseguro (`unsafe_place`)

Registros antigos sem categoria continuam sendo lidos como condição da via. Categorias de segurança e urgências extremas exigem uma descrição curta. Urgência extrema é um aviso comunitário e não substitui polícia ou atendimento de emergência.

## Fora deste corte

- Push com app fechado
- HERE real (trocar fixture / unavailable pela function + secret)
- Web Home com o mesmo cartão de avisos
- Painel admin de moderação de avisos

## Geometria

- Com `path` (HERE ou fixture): corredor ao longo da polyline
- Sem `path`: reta origem → destino (comportamento anterior)
