# Relatório de implementação — incidentes de segurança

Data: 17 de setembro de 2026
Branch: `feat/incidentes-seguranca`

## Resultado

O fluxo de ocorrências do RotaTrucks foi ampliado para registrar riscos de segurança estruturados sem remover o núcleo de passabilidade definido pelo cliente.

Categorias entregues:

- Condição da via
- Acidente
- Bloqueio
- Risco de roubo
- Local inseguro

Cada registro continua informando o caminhão, se é possível seguir, observação, GPS, autoria, data e urgência.

## Implementação

### Domínio compartilhado

- Criado o tipo `ReportCategory` com cinco valores persistidos.
- Criados rótulos e descrições compartilhados entre web, mobile, feed e alertas.
- Centralizada a validação de categoria, veículo, status, urgência, localização e observação.
- Categorias de segurança e urgências extremas exigem descrição de pelo menos oito caracteres.
- Registros antigos sem categoria são normalizados como `route_condition`.

### Firestore

- Novos documentos da coleção `reports` persistem `category`.
- As regras aceitam somente os cinco valores conhecidos.
- As regras também exigem descrição mínima para categorias de segurança e urgência extrema.
- Edição e exclusão de ocorrências pelo cliente continuam bloqueadas.

### Alertas e comunidade

- Categoria passa a fazer parte das fontes de alerta e dos itens do feed.
- Feed e cartões usam os mesmos rótulos gerados pelo domínio.
- O algoritmo existente de corredor, proximidade, confirmação “Continua lá?” e redução de prioridade foi preservado.

### Mobile

- Formulário ganhou seleção de categoria.
- A pergunta de passabilidade passou a ser “Dá para seguir com o caminhão?”.
- Validação e instruções mudam conforme categoria e urgência.
- Urgência extrema informa que o recurso não substitui polícia ou atendimento de emergência.

### Web

- Formulário ganhou as mesmas categorias do mobile.
- Web ganhou o controle de urgência extrema que antes existia apenas no mobile.
- Feed utiliza os rótulos estruturados do domínio.

## Correção dos dados piloto

Foram removidos os seeds que apresentavam como dados de Barra Velha:

- uma restrição da SC-401, localizada em Florianópolis;
- um viaduto de 4,5 m cuja fonte localizada do DNIT aponta para o km 339 da BR-101 Sul, na região de Tubarão.

O piloto mantém apenas marcações declaradas como demonstração, sem alegar validade oficial. Restrições oficiais deverão entrar em módulo próprio com fonte, coordenadas, data de verificação, vigência e horários.

## Achados e correções do code review

O primeiro passe repetia categoria e passabilidade na apresentação, por exemplo “Não passa · Acidente: não passa · Acidente”. A composição foi corrigida para exibir um único rótulo claro.

Também foi corrigido o texto de condição liberada: `route_condition + passa` agora produz “Condição da via: passa”, enquanto acidentes e bloqueios liberados continuam usando “passa com atenção”.

Foram acrescentados testes para todas as categorias conhecidas e para os rótulos que possuem semântica diferente.

## Evidências de verificação

- `npm test` em `back`: 6 testes, 6 aprovados.
- `npx tsc --noEmit` em `mobile`: aprovado sem erros.
- `npm run build` em `web`: aprovado; 90 módulos transformados.
- `git diff --check`: aprovado.

O lint web continua falhando por um problema preexistente em `web/src/lib/routing.ts`: a função comum `useFixture` é interpretada como React Hook pelo nome. O build e o TypeScript passam. O lint mobile não possuía configuração e o comando do Expo tentou instalá-la automaticamente, mas a própria CLI não conseguiu carregar `eslint`; os arquivos automáticos foram descartados.

## Fora deste incremento

- Restrições oficiais e ingestão de DNIT, DER, PRF ou prefeituras
- Pontos seguros, avaliações e selos
- Modo seguro feminino
- Histórico e estatísticas de segurança por rota
- SOS, contatos de emergência e pânico silencioso
- KYC e antifraude
- Premium, anúncios, marketplace, pagamentos e white label

Ordem recomendada para os próximos módulos: restrições oficiais, pontos seguros, modo seguro feminino, histórico de segurança, SOS e monetização.

## Incremento posterior: restrições e pontos seguros

Foi adicionada uma base curada somente leitura para restrições e pontos seguros. O domínio avalia dimensões, peso, tipo, vigência e horários contra o caminhão cadastrado. Mobile e web exibem pins distintos e uma lista de paradas com serviços e avaliações resumidas. Os dados iniciais são explicitamente demonstrativos; ingestão automática e avaliações públicas permanecem pendentes.
