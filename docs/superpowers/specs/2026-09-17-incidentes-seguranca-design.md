# Incidentes de segurança estruturados

Data: 17 de setembro de 2026

## Objetivo

Expandir o fluxo atual de ocorrências do RotaTrucks para registrar riscos de segurança de forma estruturada, sem perder o núcleo definido no `RotaTrucks_Pacote_Completo_v2.pdf`: informar se uma via passa ou não passa para determinado caminhão.

O primeiro corte cobre relatos colaborativos, feed e alertas durante o uso do aplicativo. Ele não implementa SOS, contato com autoridades, pontos seguros, KYC, cobrança ou publicidade.

## Fontes e limites

O desenho cruza quatro documentos do cliente:

- `RotaTrucks_Pacote_Completo_v2.pdf`: define conta, caminhão, mapa, passa/não passa, GPS e perfil como núcleo obrigatório.
- `SEGURANÇA NA ESTRADA - ROTA TRUCKS.pdf`: recomenda monitoramento colaborativo de acidentes, bloqueios, roubos e locais inseguros.
- `Resumo_Normas_Restricoes_RotaTrucks.pdf`: propõe combinar relatos e fontes oficiais, mas não define um processo confiável de ingestão ou moderação.
- `Modelo_Monetizacao_App_RotaTrucks.pdf`: apresenta possibilidades comerciais, sem requisitos de produto suficientes para implementação neste corte.

Relatos de usuários e restrições oficiais permanecerão conceitos separados. Um relato comunitário nunca será apresentado como norma oficial.

## Escopo funcional

### Categorias

Cada ocorrência terá uma categoria obrigatória:

| Valor persistido | Texto na interface | Uso |
|---|---|---|
| `route_condition` | Condição da via | Altura, peso, largura ou outra condição que define passa/não passa |
| `accident` | Acidente | Acidente na pista ou no acostamento |
| `road_block` | Bloqueio | Via fechada, obra, queda de barreira ou manifestação |
| `robbery_risk` | Risco de roubo | Suspeita, tentativa ou situação de risco no trecho |
| `unsafe_place` | Local inseguro | Parada ou trecho com pouca iluminação, vigilância ou estrutura |

Registros antigos, que não possuem `category`, serão lidos como `route_condition`. Não haverá migração destrutiva do banco.

### Passabilidade e urgência

O campo atual `status`, com `passa` ou `nao_passa`, continua obrigatório em todas as categorias. Na interface, a pergunta muda de “Situação” para “Dá para seguir com o caminhão?” para continuar fazendo sentido em acidentes e riscos.

A urgência continua tendo dois valores:

- `normal`: aparece no corredor da rota, conforme as regras já existentes.
- `extreme`: pode aparecer perto do usuário mesmo sem destino.

Urgência extrema significa risco imediato. Ela exige descrição com pelo menos oito caracteres. A interface explicará que não substitui polícia, emergência ou atendimento oficial. O aplicativo não fará chamadas nem enviará localização a terceiros neste corte.

### Formulário

Mobile e web terão a mesma sequência conceitual:

1. Escolher categoria.
2. Confirmar tipo de caminhão.
3. Informar se é possível seguir (`passa` ou `nao_passa`).
4. Escrever observação.
5. Marcar urgência extrema quando aplicável.
6. Confirmar que o GPS está disponível e salvar.

A observação será obrigatória para `accident`, `road_block`, `robbery_risk` e `unsafe_place`, com mínimo de oito caracteres. Ela continuará opcional para `route_condition`, exceto quando a urgência for extrema.

O web ganhará o mesmo controle de urgência disponível no mobile para evitar dados diferentes conforme a plataforma.

## Modelo de domínio

O domínio de `Report` ganhará:

```ts
type ReportCategory =
  | 'route_condition'
  | 'accident'
  | 'road_block'
  | 'robbery_risk'
  | 'unsafe_place'
```

Também serão adicionados:

- lista ordenada de categorias;
- type guard para dados vindos do Firestore;
- normalização de registros antigos para `route_condition`;
- rótulos e descrições compartilhados entre web, mobile, feed e alertas;
- validação central do rascunho da ocorrência.

A validação de categoria, observação, coordenadas, caminhão, status e urgência ficará no pacote compartilhado. As telas apenas apresentarão os erros retornados pelo domínio.

## Persistência e segurança

Novas ocorrências salvarão `category` na coleção `reports`. As regras do Firestore aceitarão somente os cinco valores definidos e continuarão proibindo edição e exclusão pelo cliente.

O parser continuará aceitando documentos antigos sem `category`, normalizando-os em memória. Documentos novos sempre terão a categoria persistida.

Nenhum dado adicional de identidade será exibido. `authorId` continuará sendo usado somente para autoria e controles internos.

## Feed, mapa e alertas

O feed da comunidade e os cartões de alerta usarão o rótulo da categoria, por exemplo:

- “Acidente: não passa”;
- “Bloqueio: passa com atenção”;
- “Risco de roubo”;
- “Local inseguro”.

As ocorrências continuarão filtradas por proximidade e tipo de caminhão. O algoritmo atual de corredor, confirmação “Continua lá?” e redução de prioridade será preservado.

No mapa, este corte não cria cinco novos símbolos. Os pins continuam usando passa/não passa e urgência para não sobrecarregar a leitura em movimento. A categoria aparece no cartão e no feed.

## Dados piloto

Os seeds que atribuem uma restrição da SC-401 e um viaduto de 4,5 m a Barra Velha não podem continuar apresentados como dados operacionais confirmados:

- a restrição oficial localizada é da SC-401 em Florianópolis e possui horários diferentes do PDF;
- a notícia do DNIT localizada para o viaduto de 4,5 m refere-se ao km 339 da BR-101 Sul, na região de Tubarão.

Neste corte, esses dois seeds serão removidos. O piloto manterá apenas marcações explicitamente identificadas como demonstração, sem alegar fonte oficial ou validade operacional. Dados oficiais voltarão em um módulo próprio de restrições, com coordenadas, fonte, data de verificação, vigência e janela de horário.

## Tratamento de erros

- Categoria ausente: impedir envio e indicar o campo.
- Categoria de segurança sem descrição suficiente: impedir envio e explicar o mínimo.
- Urgência extrema sem descrição suficiente: impedir envio.
- GPS indisponível: manter o comportamento atual e não gravar coordenadas fictícias.
- Documento legado sem categoria: abrir normalmente como condição da via.
- Documento com categoria desconhecida: usar `route_condition` na leitura, sem propagar valor inválido para a interface.

## Arquivos afetados

- `back/src/domain/report.ts`: categorias, rótulos, normalização e validação.
- `back/src/services/database.service.ts`: leitura e gravação de categoria.
- `back/src/domain/community.ts`: categoria no item do feed e composição dos rótulos.
- `back/src/services/route-alert.service.ts`: categoria e texto dos alertas.
- `back/src/index.ts`: exportações públicas.
- `back/firestore.rules`: validação do novo campo.
- `mobile/src/screens/ReportScreen.tsx`: seleção de categoria e validação compartilhada.
- `mobile/src/components/RouteAlertCard.tsx`: apresentação da categoria quando necessário.
- `mobile/src/screens/CommunityScreen.tsx`: rótulos do feed.
- `web/src/screens/ReportScreen.tsx`: seleção de categoria e urgência.
- `web/src/screens/CommunityScreen.tsx`: rótulos do feed.

## Verificação

O incremento será considerado pronto quando:

1. Uma ocorrência de cada categoria puder ser criada no mobile e no web.
2. Categorias de segurança não puderem ser salvas sem descrição suficiente.
3. Uma urgência extrema aparecer para usuário próximo sem destino.
4. Uma ocorrência normal aparecer somente quando relevante para a rota.
5. Feed e cartão exibirem categoria e passabilidade em linguagem simples.
6. Um documento legado sem `category` continuar sendo lido como condição da via.
7. As regras do Firestore rejeitarem categorias desconhecidas.
8. Os builds TypeScript de back, mobile e web passarem.
9. Os seeds geograficamente incorretos não aparecerem mais como restrições reais.

## Fora deste incremento

- Ingestão de DNIT, DER, PRF, prefeituras ou OpenStreetMap.
- Bloqueio automático de rota por regra oficial.
- Pontos seguros, avaliações e selos.
- Modo seguro feminino e comunidade exclusiva.
- SOS, pânico silencioso, contatos de emergência e envio a autoridades.
- KYC, antifraude, histórico de viagens e relatório estatístico de segurança.
- Premium, anúncios, marketplace, pagamentos e white label.

Esses itens serão especificados em incrementos independentes, nessa ordem recomendada: restrições oficiais, pontos seguros, modo seguro feminino, histórico de segurança, SOS e monetização.
