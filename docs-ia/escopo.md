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
- Restrições curadas por caminhão e pontos seguros demonstrativos no mapa e em lista (ver docs-ia/restricoes-pontos-seguros.md)
- SOS local em dois passos, protocolo no aparelho, ligação 191, até três contatos e SMS preparado pelo sistema do celular
- Pontos seguros com busca, filtros, ordenação e detalhes
- Comparação dos planos Gratuito, Premium e Frotas, sem cobrança ativa
- Preferência privada de modo seguro feminino e interfaces previstas para pânico silencioso, denúncia anônima e comunidade
- Web e mobile: ocorrencias estruturadas por categoria (condicao da via, acidente, bloqueio, risco de roubo e local inseguro)
- Casca HERE sem chave: fixtures, client de rota web/mobile, RouteMap no web, path no MockMap, avisos com polyline, pins filtrados, checklist (ver docs-ia/here-checklist.md)

## Decidir juntos (PDFs / sprint)

- Dados oficiais do piloto: validar coordenadas, vigencia e fonte antes de publicar (os exemplos de viaduto 4,5 m e SC-401 nao pertencem a Barra Velha)

## Fora ate chave / decisao de produto

- Ligar secret HERE_API_KEY + URL da function (amanha)
- Envio automático de SOS, rastreamento temporário e link seguro (dependem de Firebase Blaze e provedor SMS)
- Cobranca Premium / AdMob
- Ingestao automatica DNIT / DER
- Painel admin de aprovacao de comunidades (hoje: Console Firebase)

Ver docs-ia/here-checklist.md.
