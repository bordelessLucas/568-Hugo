# Relatório consolidado - segurança, restrições e pontos seguros

Data: 17 de setembro de 2026
Branch: `feat/incidentes-seguranca`

## Resumo

Este trabalho entregou dois incrementos do RotaTrucks: incidentes de segurança estruturados e uma base curada de restrições viárias/pontos seguros. Os recursos foram integrados ao backend, Firestore, mobile e web sem misturar relatos comunitários com fontes verificadas.

## Incidentes de segurança

O fluxo de ocorrências passou a aceitar condição da via, acidente, bloqueio, risco de roubo e local inseguro. Cada registro contém categoria, caminhão, passabilidade, observação, GPS, autoria, data e urgência.

### Backend e Firestore

- Criados `ReportCategory`, opções e textos compartilhados.
- Centralizada a validação de categoria, veículo, status, urgência, localização e observação.
- Categorias de segurança e urgências extremas exigem descrição mínima.
- Registros antigos sem categoria são normalizados como condição da via.
- Feed e alertas passaram a carregar categoria.
- Regras do Firestore aceitam somente valores conhecidos e mantêm update/delete bloqueados.
- Preservados corredor da rota, proximidade, confirmação “Continua lá?” e redução de prioridade.

### Frontend

- Mobile e web receberam seleção de categoria.
- A pergunta principal passou a ser “Dá para seguir com o caminhão?”.
- Instruções e validações mudam conforme categoria e urgência.
- A web recebeu o controle de urgência extrema.
- Urgências extremas informam que o recurso não substitui polícia ou emergência.
- Feed, alertas e formulários usam os mesmos rótulos do domínio.

## Restrições viárias curadas

Foi criado o domínio `OfficialRestriction`, com título, descrição, localização, órgão, URL, estado da fonte, data de verificação, vigência, dias, horários, limites dimensionais, peso, tipos de caminhão e efeito de alerta ou bloqueio.

O avaliador considera:

- altura, largura, comprimento e peso;
- tipo do caminhão;
- início e fim da vigência;
- dia da semana;
- horários, incluindo intervalos que atravessam meia-noite;
- estado da fonte e efeito configurado.

O resultado é “não se aplica”, “atenção” ou “bloqueado”, acompanhado dos motivos. Uma fonte verificada exige órgão, URL HTTPS e data. O aplicativo ainda não recalcula automaticamente uma rota alternativa.

### Persistência

- Criada a coleção `officialRestrictions`.
- O cliente pode ler, mas não criar, alterar ou excluir registros.
- Documentos inválidos são descartados individualmente.
- Sem Firebase configurado, fixtures explicitamente demonstrativas são utilizadas.
- Uma coleção válida e vazia permanece vazia, sem receber demonstrações silenciosamente.

## Pontos seguros

Foi criado o domínio `SafePlace`, com categoria, localização, horário, serviços, audiência, origem, verificação, nota média e quantidade de avaliações.

Serviços estruturados: estacionamento para caminhão, iluminação, vigilância, banheiro, chuveiro, alimentação, oficina e pernoite.

O selo “Ponto Amigo da Caminhoneira” exige registro curado e verificado, audiência correspondente e banheiro, chuveiro, iluminação e vigilância.

- Criada a coleção `safePlaces`, somente leitura para o cliente.
- Pontos são ordenados por distância quando há GPS.
- Sem localização, a ordem cadastrada é preservada e a interface informa a limitação.
- Avaliações são resumos curados; publicação pública ainda não foi aberta.

## Frontend entregue

### Mobile

- Pins diferentes para relatos, restrições e pontos seguros.
- Cores para bloqueio, atenção, local seguro e estado neutro.
- Toque no pin abre título, compatibilidade, motivos e origem.
- Nova aba “Paradas”.
- Lista de pontos seguros com serviços, nota, avaliações e selo.
- Estados de carregamento, vazio e localização indisponível.
- Aviso de que as condições podem mudar e devem ser confirmadas.

### Web

- Marcadores separados no MapLibre.
- Popups com título, compatibilidade, detalhes e origem.
- Nova rota `/pontos-seguros` e item na navegação.
- Lista responsiva com serviços, avaliações, selo, carregamento e estado vazio.

## Correção dos dados piloto

Foram removidos os seeds que atribuíam incorretamente a Barra Velha uma restrição da SC-401, localizada em Florianópolis, e um viaduto de 4,5 m cuja fonte localizada do DNIT aponta para a região de Tubarão.

Os novos seeds são fictícios, usam nomes naturais e mostram “Dado simulado para teste” nos detalhes. Nenhum dado é apresentado como oficial sem fonte primária conferida.

## Correções do code review

- Eliminada repetição de categoria/passabilidade nos rótulos.
- Corrigida a diferença entre “Condição da via: passa” e acidente/bloqueio “passa com atenção”.
- Frontends deixaram de consumir somente fixtures e passaram a consultar os serviços compartilhados.
- Coleções Firestore vazias deixaram de receber demonstrações indevidamente.
- Adicionados detalhes dos pins no mobile e nos popups web.
- Mantida a separação entre relato, demonstração e fonte verificada.
- Confirmada a proibição de escrita nas coleções curadas.

## Validação

- Backend: 18 testes aprovados, nenhuma falha.
- Mobile: `npx tsc --noEmit` aprovado.
- Web: `npm run build` aprovado, 96 módulos transformados.
- Git: `git diff --check main...HEAD` aprovado.

Os testes cobrem categorias de incidentes, dimensões, peso, tipo, vigência, horários, janela que atravessa meia-noite, requisitos de fonte, selo para caminhoneiras, distância, apresentação dos pins e ausência dos seeds incorretos.

O build web mantém apenas o aviso de bundle superior a 500 kB. O lint web possui um problema preexistente em `web/src/lib/routing.ts`, onde `useFixture` é interpretada como React Hook. O lint mobile ainda não possui configuração funcional.

## Documentos produzidos

- `docs/superpowers/specs/2026-09-17-incidentes-seguranca-design.md`
- `docs/superpowers/plans/2026-09-17-incidentes-seguranca.md`
- `docs/superpowers/specs/2026-09-17-restricoes-pontos-seguros-design.md`
- `docs/superpowers/plans/2026-09-17-restricoes-pontos-seguros.md`
- `docs-ia/restricoes-pontos-seguros.md`
- `docs-ia/avisos-rota.md`
- `docs-ia/escopo.md`
- `docs-ia/here-checklist.md`

## Experiência de segurança adicionada

- Advertências do mapa resumidas em comandos grandes e operacionais, com detalhes recolhidos.
- SOS no canto inferior esquerdo, confirmação em dois toques e orientação de uso responsável.
- Registro local de protocolo, horário, usuário, caminhão e GPS disponível.
- Ligação PRF 191 e SMS preparado para até três contatos de confiança.
- Pontos seguros com pesquisa, filtros, ordenação e detalhes.
- Comparação clara dos planos Gratuito, Premium e Frotas.
- Preferência feminina privada, filtro de pontos recomendados e interfaces para pânico silencioso, denúncia anônima e comunidade.

## Funcionalidades ainda pendentes dos PDFs

- Ingestão automática de DNIT, DER, PRF, prefeituras e diários oficiais.
- Painel administrativo de curadoria e moderação.
- Redirecionamento automático de rota.
- Avaliações públicas com antifraude e moderação.
- Backend e moderação do modo feminino e comunidade de caminhoneiras.
- Histórico e estatísticas de segurança por rota.
- Envio automático do SOS, push, rastreamento temporário, link seguro e confirmação de recebimento (exigem Blaze e provedor configurado).
- KYC e antifraude de frete.
- Premium, anúncios, marketplace, pagamentos e white label.

Ordem recomendada: avaliações moderadas, modo seguro feminino, histórico de segurança, SOS e monetização.

## Estado da entrega

- Implementação continuada na branch atual autorizada pelo cliente.
- O transporte automático de SMS/push permanece desligado até a ativação do Firebase Blaze e a configuração segura de um remetente no backend.
- Nenhuma credencial Twilio foi incluída no cliente ou no repositório.
