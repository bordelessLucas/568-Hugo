# Experiência de segurança para o motorista - design

Data: 17 de setembro de 2026

## Objetivo

Transformar a segurança do RotaTrucks em uma experiência automática, visual e compreensível para caminhoneiros com pouca familiaridade tecnológica. O aplicativo deve usar rota, localização e caminhão ativo sem pedir configurações repetidas, separar advertência de emergência e implementar os fluxos previstos nos PDFs que funcionam sem Firebase Blaze ou provedor de SMS.

## Fontes

- `RotaTrucks_Pacote_Completo_v2.pdf`: conta, caminhão, mapa, GPS e passa/não passa são o núcleo do produto.
- `Resumo_Normas_Restricoes_RotaTrucks.pdf`: altura, largura, comprimento, peso, horários e fontes públicas orientam a compatibilidade.
- `SEGURANÇA NA ESTRADA - ROTA TRUCKS.pdf`: prevê pontos seguros, SOS com localização, monitoramento colaborativo, modo noturno, modo seguro feminino, pânico silencioso, comunidade de caminhoneiras e selo para paradas.
- `Modelo_Monetizacao_App_RotaTrucks.pdf`: prevê plano premium, histórico, ausência de anúncios e suporte diferenciado, mas não define preços ou cobrança.

O PDF não especifica API, fornecedor, protocolo operacional nem integração pública com a PRF. O canal público confirmado da PRF é o telefone 191. Integrações com PRF, seguradora ou Twilio exigem parceria, credenciais e infraestrutura externas.

## Escopo executável sem Blaze e Twilio

Entram neste incremento:

- priorização automática de advertências usando caminhão, GPS e rota;
- comandos visuais simplificados;
- SOS em dois passos no mapa;
- ligação para 191 e SMS preparado pelo sistema operacional;
- até três contatos de confiança armazenados localmente;
- protocolo local de SOS com horário, caminhão e localização;
- pânico silencioso no modo feminino usando o mesmo transporte local;
- pontos seguros com busca, filtros, ordenação e detalhes;
- comparação legível de planos sem cobrança;
- modo seguro feminino, filtros, denúncia anônima local e entrada para comunidade;
- seeds realistas, mas identificados nos detalhes como dados simulados.

Ficam preparados por interfaces, mas desativados:

- SMS automático por Twilio/Zenvia;
- localização remota contínua;
- links temporários públicos;
- confirmação remota de entrega;
- Cloud Functions de emergência.

## Princípios de UX

- Uma ação principal por tela.
- Texto curto, fonte legível, alto contraste e alvos grandes.
- Ícone acompanhado de texto nas ações críticas.
- Uma advertência prioritária por vez.
- Termos operacionais em vez de termos técnicos.
- Informações detalhadas ficam atrás de “Ver detalhes”.
- Vermelho é reservado a bloqueio e emergência; laranja indica atenção; verde indica passagem/local recomendado.
- Nunca afirmar que uma mensagem foi enviada quando apenas o compositor de SMS foi aberto.

## Advertências automáticas

### Entrada

O avaliador recebe:

- caminhão ativo e suas dimensões;
- posição atual;
- destino e geometria da rota;
- restrições curadas;
- ocorrências comunitárias;
- pontos seguros;
- horário local e preferências de segurança.

O usuário não escolhe manualmente o tipo de caminhão no fluxo de advertência. Sem caminhão ativo, o aplicativo pede cadastro e não promete compatibilidade.

### Prioridade

Ordem padrão:

1. Bloqueio ou restrição incompatível com o caminhão.
2. SOS ativo.
3. Acidente ou bloqueio extremo próximo.
4. Risco de roubo/local inseguro no corredor.
5. Advertência dimensional ou temporal.
6. Ponto seguro relevante, especialmente em modo noturno.

Empates consideram distância e urgência. Somente itens à frente e dentro do corredor da rota entram, salvo urgência extrema próxima.

### Comandos

- `STOP`: “NÃO PASSA - DESVIE”.
- `SLOW_DOWN`: “ATENÇÃO - REDUZA”.
- `RISK_AHEAD`: “RISCO À FRENTE”.
- `SAFE_STOP`: “PARADA SEGURA PRÓXIMA”.

O cartão mostra comando, distância, motivo principal e uma ação. Fonte, dimensões, vigência e detalhes ficam expandidos sob demanda.

## SOS

### Localização e interação

O botão SOS fica fixo no canto inferior esquerdo do mapa. Ele não aparece dentro do cartão de advertência.

Fluxo:

1. Primeiro toque abre confirmação grande.
2. A confirmação informa que SOS é para perigo real, não para advertências comuns, e que comunicação falsa pode ter consequências.
3. Segundo toque cria o protocolo.
4. O protocolo registra ID, usuário, caminhão, localização, horário, estado e canais acionados.
5. A tela oferece “Ligar PRF - 191”, “Avisar contatos” e “Encerrar SOS”.

Não há chamada ou mensagem silenciosa no SOS geral. A ligação abre o discador com `tel:191`. O aviso abre o compositor de SMS com texto, protocolo e link de coordenadas. O aplicativo registra `prepared`, e somente registra `handed_to_os` quando o sistema operacional aceita abrir o canal; não registra entrega.

### Contatos de confiança

- Mínimo zero, máximo três.
- Nome, telefone em formato validado e relação opcional.
- Persistência local no dispositivo neste incremento.
- Explicação de privacidade e remoção simples.
- Sem contatos, a ação de aviso orienta o cadastro e mantém a opção 191.

### Transporte futuro

O domínio expõe `EmergencyTransport` com capacidades e resultado. Implementações atuais: `deviceSms` e `mockPush`. `twilioSms` fica representado como indisponível, sem credenciais ou chamadas de rede. Isso permite ativar o backend depois sem alterar o fluxo visual.

## Modo seguro feminino

O modo é opcional e privado. Ativá-lo não revela publicamente que a motorista está sozinha ou em viagem.

Recursos:

- priorização de pontos avaliados/recomendados para mulheres;
- filtros de banheiro, chuveiro, iluminação e vigilância;
- selo “Ponto Amigo da Caminhoneira” conforme regras existentes;
- pânico silencioso;
- denúncia anônima;
- atalho para comunidade de caminhoneiras.

O pânico silencioso evita som e confirmação chamativa, mas mantém proteção contra toque acidental: primeiro toque abre uma faixa discreta e o segundo toque confirma. Ele prepara SMS para contatos sem abrir ligação automaticamente. A interface deixa claro que, sem backend, o envio ainda depende da confirmação no aplicativo de mensagens.

Denúncias anônimas ficam locais ou em modo simulado; não serão apresentadas como enviadas a autoridade ou moderação inexistente.

## Pontos seguros

A tela inclui:

- busca por nome/endereço;
- filtros de estacionamento, vigilância, iluminação, banheiro, chuveiro, alimentação, oficina, pernoite e recomendação feminina;
- ordenação por distância, nota ou quantidade de serviços;
- cartão com distância, funcionamento, nota, avaliações, serviços e verificação;
- detalhe “Por que este ponto é recomendado?”;
- ações “Ver no mapa”, “Traçar rota” e “Ligar”, habilitadas somente quando há dados;
- aviso de que condições podem mudar.

Os pontos alimentam a advertência `SAFE_STOP` quando relevantes à rota, ao horário ou às preferências.

## Planos

O seletor deixa de ser apenas um controle e passa a comparar:

- Gratuito: mapa, caminhão, advertências essenciais, ocorrências, SOS local e pontos seguros.
- Premium: histórico de rota, filtros avançados, modo noturno seguro, relatórios e ausência de anúncios.
- Frotas: múltiplos motoristas, painel e relatórios agregados.

Cada recurso recebe estado `available` ou `planned`. Selecionar plano altera somente preferência/local preview. Não há preço inventado, checkout, cobrança ou bloqueio de segurança essencial. SOS e alertas críticos permanecem gratuitos.

## Seeds

Adicionar cenários suficientes para exercitar:

- altura incompatível;
- peso incompatível;
- bloqueio temporário;
- acidente;
- risco de roubo;
- local inseguro;
- parada completa;
- parada recomendada para caminhoneiras;
- advertência noturna.

Os títulos serão naturais, sem prefixo “Demonstração”. Cada registro terá metadado `demo` e os detalhes exibirão “Dado simulado para teste”. Não serão usados nomes de empresas reais, alegações oficiais ou coordenadas atribuídas a ocorrências verdadeiras.

## Estados de erro e contingência

- Sem GPS: SOS permite ligar 191 e informa que localização não será incluída.
- Sem caminhão: advertências dimensionais ficam indisponíveis e o cadastro é oferecido.
- Sem destino: apenas urgências extremas próximas e SOS aparecem.
- Sem SMS: copiar mensagem e ligar 191 continuam disponíveis.
- Sem internet: contatos, protocolo local, ligação e SMS do aparelho permanecem disponíveis quando suportados.
- Falha ao abrir aplicativo externo: mensagem clara e telefone 191 visível para digitação manual.
- Push simulado nunca será descrito como entregue.

## Dados e privacidade

- Coletar apenas dados necessários ao protocolo.
- Contatos ficam locais até existir consentimento e backend adequado.
- Localização de emergência tem finalidade explícita.
- Encerramento interrompe qualquer atualização local futura.
- Nenhum dado de modo feminino revela vulnerabilidade publicamente.
- Logs não contêm telefone completo nem conteúdo sensível.

## Testes

- prioridade das advertências e filtragem pelo corredor;
- comandos e textos operacionais;
- caminhão ausente e restrição incompatível;
- SOS em dois passos e prevenção de toque acidental;
- protocolo com e sem GPS;
- limite e validação dos contatos;
- resultado realista do transporte local;
- pânico silencioso e privacidade;
- filtros/ordenação de pontos seguros;
- planos e estados disponível/planejado;
- seeds marcados como simulados nos detalhes;
- TypeScript mobile, build web e testes backend.

## Critérios de aceite

1. A advertência considera automaticamente caminhão, rota, GPS e horário.
2. Apenas uma advertência prioritária é exibida com comando curto e grande.
3. SOS fica no canto inferior esquerdo do mapa e exige dois passos.
4. SOS não é confundido com advertência e oferece 191, contatos e encerramento.
5. Até três contatos podem ser cadastrados sem backend pago.
6. O aplicativo não afirma envio ou entrega que não ocorreu.
7. Pontos seguros possuem busca, filtros, ordenação, detalhes e ações.
8. Planos explicam benefícios sem cobrança ou bloqueio de segurança.
9. O modo feminino não expõe a motorista e inclui os fluxos possíveis localmente.
10. Seeds parecem cenários operacionais, mas são identificados como simulados nos detalhes.
11. Testes e builds permanecem aprovados.

## Fora do escopo

- SMS automático real e rastreamento remoto sem Blaze/provedor.
- Integração direta com PRF ou seguradora.
- Confirmação real de entrega.
- Moderação humana de denúncias.
- Cobrança, preços, anúncios e painel de frotas funcional.
- Garantia de segurança de um ponto ou rota.
