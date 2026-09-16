# Escopo - RotaTrucks

Quem usa: caminhoneiro no celular, em movimento ou parado. Consulta rapida. Nao e painel de escritorio.

O que o produto resolve: saber se a via passa ou nao passa para o tipo e o tamanho do caminhao.

## Ja no web e no mobile (sem chave HERE)

- Conta: nome, e-mail, senha (minimo 6), reset de senha
- Onboarding em etapas: genero, tipo de caminhao, medidas (pulavel, com aviso pendente)
- Perfil com varios caminhoes na mesma conta (usar / editar o atual)
- Configuracoes locais: plano (sem cobranca), tema, notificacoes, sons, privacidade
- Mapa mock + busca Photon com distancia
- Mobile: tela de reportar ocorrencia (passa / nao passa) gravando no Firestore
- Comunidade: lista, detalhe/feed, pedir/editar/cancelar pedido pendente (ver docs-ia/comunidades.md)
- Mobile: avisos na rota estilo Waze + Continua la? (ver docs-ia/avisos-rota.md)
- Casca HERE sem chave: fixtures, client de rota web/mobile, RouteMap no web, path no MockMap, avisos com polyline, pins filtrados, checklist (ver docs-ia/here-checklist.md)

## Decidir juntos (PDFs / sprint)

- Seed piloto Barra Velha / SC (viaduto 4,5 m, SC-401) - seed ja existe no back

## Fora ate chave / decisao de produto

- Ligar secret HERE_API_KEY + URL da function (amanha)
- SOS, modo seguro, pontos seguros
- Cobranca Premium / AdMob
- Ingestao DNIT / DER
- Painel admin de aprovacao de comunidades (hoje: Console Firebase)

Ver docs-ia/here-checklist.md.
