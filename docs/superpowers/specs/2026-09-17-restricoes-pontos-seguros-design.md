# Restrições oficiais e pontos seguros - design

Data: 17 de setembro de 2026

## Objetivo

Adicionar ao RotaTrucks uma base curada de restrições viárias e pontos seguros, exibida no mapa e avaliada contra o caminhão do usuário. O incremento deve separar claramente informação oficial, conteúdo demonstrativo e relato comunitário.

## Fontes e limites

- `RotaTrucks_Pacote_Completo_v2.pdf` mantém como núcleo a resposta sobre a viabilidade da rota para o caminhão cadastrado.
- `Resumo_Normas_Restricoes_RotaTrucks.pdf` orienta altura, peso, dimensões, horários e órgãos públicos como atributos de restrições.
- `SEGURANÇA NA ESTRADA - ROTA TRUCKS.pdf` orienta pontos seguros avaliados, infraestrutura e selo para caminhoneiras.
- `Modelo_Monetizacao_App_RotaTrucks.pdf` permite futuramente destacar estabelecimentos, mas publicidade e pagamento não fazem parte deste incremento.

Não haverá ingestão automática de DNIT, DER ou prefeituras neste corte. A ausência de integração evita apresentar dados incompletos como cobertura oficial nacional.

## Decisão de arquitetura

O pacote `back` continuará sendo a fonte única dos contratos, validação e compatibilidade. Serão criados dois domínios independentes:

- `OfficialRestriction`: regra viária curada e rastreável;
- `SafePlace`: local de parada com estrutura e avaliação.

Relatos comunitários continuam em `reports`. Uma restrição não será criada a partir de um relato sem revisão editorial. Pontos seguros não serão tratados como garantia de segurança.

## Restrições oficiais

### Modelo

Cada restrição contém:

- identificador, título e descrição;
- localização e, opcionalmente, endereço;
- órgão emissor e URL da fonte;
- estado da fonte: `verified`, `demo` ou `expired`;
- data da última verificação e vigência opcional;
- dias da semana e uma ou mais janelas de horário opcionais;
- limites opcionais de altura, largura, comprimento e peso;
- tipos de caminhão atingidos, quando a regra não for dimensional;
- efeito `warning` ou `blocked`.

Uma restrição sem limite dimensional e sem tipo de caminhão será inválida. Uma restrição marcada como verificada exigirá órgão, URL HTTPS e data de verificação. Dados demonstrativos usarão linguagem explícita e nunca o selo visual “oficial verificado”.

### Compatibilidade

O avaliador receberá a restrição, o caminhão e um instante. O resultado será:

- `not_applicable`: fora da vigência, dia ou horário, ou caminhão não atingido;
- `warning`: regra aplicável com efeito de atenção;
- `blocked`: regra aplicável e incompatível com o caminhão.

Os limites representam o máximo permitido. Um caminhão acima de qualquer limite ativo é incompatível. Janelas que cruzam meia-noite serão aceitas. Datas e horários serão comparados no fuso `America/Sao_Paulo`, declarado no registro para permitir extensão futura.

Neste incremento, a rota será alertada e marcada como incompatível; o aplicativo não prometerá recálculo automático por vias alternativas.

## Pontos seguros

### Modelo

Cada ponto contém:

- identificador, nome, categoria e localização;
- endereço e horário textual opcional;
- serviços estruturados: estacionamento para caminhão, iluminação, vigilância, banheiro, chuveiro, alimentação, oficina e pernoite;
- audiência: todos ou recomendado para caminhoneiras;
- origem `curated` ou `demo`;
- estado de verificação e data da última verificação;
- resumo de avaliações: nota média e quantidade.

O selo “Ponto Amigo da Caminhoneira” somente será exibido quando o registro curado possuir os requisitos mínimos definidos no domínio: banheiro, chuveiro, iluminação e vigilância. A interface usará “informações verificadas em [data]” e avisará que condições podem mudar.

### Avaliações

O incremento exibirá o resumo de avaliações e preparará o contrato de avaliação, mas não abrirá escrita pública ainda. Isso evita avaliações sem moderação, antifraude e regras de uma avaliação por usuário. A captura de avaliações será um incremento separado.

## Persistência e segurança

Serão usadas coleções somente para leitura pelo cliente:

- `officialRestrictions`;
- `safePlaces`.

Criação, alteração e exclusão ficam bloqueadas nas regras do Firestore. Nesta etapa, registros são mantidos por seed curado ou console administrativo fora do aplicativo. O parser ignora documentos inválidos individualmente para não derrubar mapa e lista.

## Experiência no mobile e web

O mapa receberá camadas e filtros independentes para:

- ocorrências comunitárias;
- restrições;
- pontos seguros.

Pins usarão linguagem visual distinta. Ao selecionar uma restrição, o usuário verá compatibilidade, motivo, vigência e fonte. Ao selecionar um ponto seguro, verá serviços, nota, quantidade de avaliações, verificação e selo quando aplicável.

Uma nova tela/lista de pontos seguros permitirá ordenar os registros próximos pela distância. Ela terá estados de carregamento, vazio e erro. O mesmo contrato e os mesmos textos serão usados no mobile e no web.

## Dados iniciais

O repositório não recuperará os exemplos geograficamente incorretos removidos no incremento anterior. Seeds operacionais serão explicitamente demonstrativos. Uma restrição somente poderá ser marcada como `verified` quando localização, texto, vigência e URL tiverem sido conferidos em fonte primária atual.

## Tratamento de erros

- Documento inválido: descartado e registrado no ambiente de desenvolvimento.
- Fonte indisponível: o registro existente continua visível com sua data de verificação, sem alegar atualização em tempo real.
- Localização indisponível: lista de pontos permanece acessível sem ordenação por distância.
- Caminhão ausente: restrições aparecem como informação, sem resultado de compatibilidade.
- Consulta Firestore indisponível: fixtures demonstrativas continuam disponíveis somente no modo já usado pelo projeto.

## Testes

O domínio terá testes para:

- todos os limites dimensionais;
- tipo de caminhão;
- vigência, dias e horários, incluindo janela que cruza meia-noite;
- fonte verificada versus demonstração;
- requisitos do selo para caminhoneiras;
- ordenação de pontos por distância;
- normalização e descarte de documentos inválidos.

Web e mobile serão validados por TypeScript/build e pelos fluxos existentes. As regras do Firestore serão verificadas para leitura pública/autenticada conforme o padrão atual e escrita negada pelo cliente.

## Critérios de aceite

1. Restrições e relatos aparecem como fontes diferentes.
2. O caminhão cadastrado recebe resultado correto para altura, largura, comprimento, peso, tipo e horário.
3. Fonte, órgão, verificação e vigência ficam visíveis nos detalhes.
4. Registros demonstrativos são identificados como demonstração.
5. Pontos seguros podem ser filtrados e ordenados por proximidade.
6. Serviços e avaliações resumidas aparecem de forma consistente no mobile e no web.
7. O selo para caminhoneiras só aparece quando os requisitos estruturais forem atendidos.
8. Clientes não conseguem escrever diretamente nas duas coleções curadas.
9. Documentos inválidos não interrompem mapa ou lista.
10. Testes, TypeScript e builds permanecem aprovados.

## Fora do escopo

- Ingestão automática e cobertura nacional garantida.
- Painel administrativo completo.
- Redirecionamento automático da rota.
- Avaliações públicas e moderação.
- SOS, pânico silencioso e compartilhamento com autoridades.
- Modo seguro feminino completo e comunidade exclusiva.
- Premium, anúncios, marketplace, pagamentos e destaque patrocinado.

Esses itens permanecem em incrementos independentes. Após esta fase, a ordem recomendada é: avaliações moderadas, modo seguro feminino, histórico de segurança, SOS e monetização.
