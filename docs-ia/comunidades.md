# Comunidades — o que está previsto (MVP)

Público: caminhoneiro no celular, pouco tempo e pouca paciência com tela técnica.  
Aprovação de novas comunidades: **admin no Console Firebase** (sem painel admin no app nesta versão).

## Objetivo

Uma área própria (fora do mapa) para:

1. Ver comunidades **aprovadas** + a **piloto Barra Velha / SC**
2. Ver o **feed** da comunidade (marcações piloto + ocorrências próximas)
3. **Pedir** criação de uma comunidade nova (fica pendente até um admin aprovar)
4. Se o pedido ainda está pendente: **editar** ou **cancelar** o pedido

## Linguagem simples (UI)

| Status no banco | Texto para o usuário |
|---|---|
| `approved` | Aberta para todos |
| `pending` | Aguardando um administrador |
| `rejected` | Pedido recusado |

Evitar jargão (“resource”, “payload”, “seed”). Preferir: “pedido”, “aguardando”, “voltar”, “cancelar pedido”.

## Fluxos do usuário final

```
Lista
 ├─ Abrir comunidade → Detalhe (feed) → Voltar
 ├─ Pedir nova comunidade → Formulário → Enviar / Voltar
 └─ (se sou o autor e está pendente)
      ├─ Editar pedido → Salvar / Voltar
      └─ Cancelar pedido → Confirmar / Voltar
```

Regras de UX:

- Todo subfluxo tem **Voltar** (nunca trava numa tela)
- Pedido enviado mostra mensagem clara: “Enviado. Um administrador ainda precisa liberar.”
- Cancelar pedido pede confirmação em linguagem simples
- Sem dashboard de aprovação no app do motorista

## Funções de back (implementadas / previstas neste pacote)

| Função | Papel |
|---|---|
| `listVisibleCommunities(userId)` | Piloto + aprovadas + as minhas (mesmo pendentes) |
| `listApprovedCommunities` | Só aprovadas |
| `listCommunitiesByCreator` | Pedidos do usuário |
| `listPilotCommunities` / `listPilotMarks` | Seed Barra Velha |
| `createCommunity` | Cria com `status: pending` |
| `getCommunity` | Busca por id (piloto ou Firestore) |
| `updatePendingCommunity` | Autor edita só enquanto `pending` |
| `deletePendingCommunity` | Autor cancela pedido pendente |
| `filterReportsNearCommunity` | Ocorrências perto do ponto da comunidade |
| `buildCommunityFeed` | Une marcas piloto + ocorrências próximas |
| `loadCommunityDetail` | Comunidade + feed prontos para a UI |

Fora do MVP cliente (não implementar no app agora):

- Aprovar / rejeitar comunidade (só Console)
- Moderação de feed
- Membros / convites / chat
- Geolocalização automática da cidade no pedido (pode usar ponto padrão ou GPS do aparelho)

## Front (web + mobile)

- Lista com status legível e ícones
- Detalhe com feed (passa / não passa) e botão Voltar
- Criar / editar / cancelar pedido como **modos** da mesma área, cada um com Voltar
- Design tokens (`@rotatrucks/back/tokens`)

## Fora deste módulo

- SOS, monetização, HERE real, ingestão DNIT
- Mapa mostrando pins da comunidade (pode vir depois; feed já lista as marcações)
