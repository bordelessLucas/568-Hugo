# Contexto do projeto — RotaTrucks

Documento de trabalho para o setup. Sintetiza os materiais do cliente em `contexto/` e o briefing operacional já existente. Fatos vêm das fontes; o que for inferência está marcado.

**Cliente / titular:** Hugo Leonardo Ledoux da Silva  
**Produto:** RotaTrucks  
**Slogan:** “A rota certa para o seu caminhão, em qualquer lugar.”  
**Ano de referência dos materiais:** 2025

## Fontes

| Arquivo | O que contém |
|---|---|
| `RotaTrucks_Pacote_Completo_v2.pdf` | Briefing do produto, telas, dados e público |
| `RotaTrucks_Apresentacao_Resumo (1).pdf` | Posicionamento e mercado |
| `Resumo_Normas_Restricoes_RotaTrucks.pdf` | Base técnica de restrições e piloto |
| `SEGURANÇA NA ESTRADA - ROTA TRUCKS.pdf` | Visão de segurança e inclusão |
| `Modelo_Monetizacao_App_RotaTrucks.pdf` | Caminhos de receita (visão de negócio) |
| `ROTA TRUCKS - Certificado de Registro...pdf` | Registro INPI do programa |
| `contextoRotaTrucks.txt` | Demanda operacional do protótipo (sprint de 7 dias) |

---

## 1. O que o cliente quer

Um aplicativo colaborativo para caminhoneiros saberem se uma rua ou rota **passa** ou **não passa** para o tipo e o tamanho do caminhão. Funciona como um GPS/Waze, mas o filtro central é a restrição de tráfego por veículo — alimentada pelos próprios motoristas e, na visão do produto, cruzada com normas e bases oficiais.

O problema que o cliente descreve: Waze e Google Maps não filtram por tipo de caminhão nem integram feedback colaborativo de motoristas sobre viabilidade da via (altura, largura, comprimento, peso, restrições locais).

Impacto esperado pelo cliente: menos multa, menos acidente, menos combustível gasto em desvio, menos tempo de entrega.

---

## 2. Público

- Caminhoneiros autônomos (o material cita mercado de mais de 2 milhões no Brasil).
- Motoristas contratados e frotas de transportadoras.
- Uso principal no celular, em movimento, com consulta rápida.

Personas citadas nos materiais, ainda sem tela própria no protótipo:

- Motorista homem: risco de assalto, furto em parada, golpe de frete, falta de local seguro para dormir.
- Motorista mulher: mesmos riscos, mais assédio, falta de estrutura (banheiro/chuveiro) e insegurança à noite.

Diferencial comercial para transportadora/patrocinador: eficiência, segurança e economia de frota, com viabilidade da rota por tipo de caminhão.

---

## 3. Escopo: o que entra agora e o que é visão

Há duas camadas nos materiais. Não misturar na primeira entrega.

### Demanda do protótipo (construir no setup)

Vem de `contextoRotaTrucks.txt` e do pacote completo. É o recorte operacional.

1. Login e cadastro (nome, e-mail, senha) com validação simples.
2. Cadastro do caminhão, associado ao usuário, para uso no mapa.
3. Mapa com localização atual e marcações da comunidade.
4. Filtro das marcações pelo veículo cadastrado (tipo e restrições de altura/peso).
5. Indicação visual de via adequada ou inadequada (passa / não passa).
6. Tela para reportar ocorrência: tipo de veículo, GPS, passa/não passa, observações, autor e data.
7. Perfil/configurações com dados básicos de usuário e veículo.
8. Interface mobile-first, mensagens de erro e campos obrigatórios.
9. Publicação como **Web App**. Android e iOS ficam preparados na estrutura, não na primeira entrega.

### Visão de produto (registrar, não implementar no protótipo)

Aparece nos PDFs de normas, segurança e monetização. Deve orientar decisões de modelo de dados e arquitetura, sem inflar o primeiro setup.

- Restrições oficiais (DNIT, DER, prefeituras) com bloqueio e redirecionamento de rota.
- Piloto citado: Barra Velha / SC.
- Mapa de pontos seguros, SOS, modo noturno, alertas de roubo, integração com PRF.
- Modo seguro feminino, comunidade de caminhoneiras, selo de ponto amigo.
- Monetização: premium, anúncios, mídia direta, dados para transportadoras, serviços, marketplace, white label.
- KYC, antifraude de frete, histórico de viagens, relatórios de segurança por rota.

O briefing original pede construção no **Adalo** (Web App, Android e iOS). O repositório está vazio e a demanda local não cita Adalo. **Stack ainda não está fechada** — decidir no setup. Não assumir no-code só porque o PDF antigo cita Adalo.

---

## 4. Fluxos e telas do protótipo

Ordem planejada no pacote completo:

1. Login / cadastro
2. Cadastro do veículo
3. Mapa com filtros
4. Formulário de nova marcação
5. Perfil / configurações

### Login e cadastro

- Campos: nome, e-mail, senha.
- Validação simples de acesso.
- Campos obrigatórios e mensagens de erro claras.
- Senha nunca em texto puro. Não há credenciais reais nos materiais (`contextoRotaTrucks.txt` só tem os rótulos “login” e “senha”, vazios).

### Veículo

Tipos pedidos no sprint:

- Toco
- Truck
- Carreta 2 eixos
- Bitruck
- Bitrem

A apresentação também cita **Carreta** (sem “2 eixos”) e **9 eixos**. Unificar a taxonomia no setup; a lista do sprint é a demanda explícita de cadastro. “9 eixos” pode entrar como tipo extra se o cliente confirmar.

Dimensões obrigatórias para o mapa:

- Altura
- Largura
- Comprimento
- Peso total

O veículo fica associado ao usuário e é a base do filtro.

### Mapa

- Mapa principal com localização atual.
- Marcações da comunidade na região.
- Diferenciar visualmente **passa** e **não passa**.
- Consulta simples e rápida no celular.
- Filtro automático pelo caminhão cadastrado.
- Mostrar restrições de altura e peso quando existirem.
- Indicar via adequada ou inadequada.

O protótipo mostra e filtra marcações. Roteirização completa (bloquear trecho e recalcular caminho, estilo GPS) é citada nos PDFs de normas e de segurança, mas **não está no sprint de 7 dias**.

### Reportar ocorrência

- Tipo de veículo.
- Localização atual (GPS).
- Classificação: passa ou não passa.
- Observações.
- Autor e data do registro.
- Persistência para aparecer no mapa.

### Perfil

- Dados básicos do usuário e do veículo.
- Navegação entre as áreas principais.
- Identidade visual do RotaTrucks (os PDFs não trazem manual de marca, cores ou logo). Pedir assets ao cliente no setup se a “identidade apresentada” não estiver neste repositório.

---

## 5. Modelo de dados mínimo

Derivado do pacote completo. Suficiente para o protótipo.

**Users**

- nome, e-mail, senha (hash), data de cadastro

**Trucks**

- usuário
- tipo (lista da seção 4)
- altura, largura, comprimento, peso total

**Reports**

- status: `passa` | `nao_passa`
- observações
- localização (latitude, longitude; endereço se a API de mapa devolver)
- tipo de caminhão
- autor
- data

### Extensões que o modelo deve aguentar depois (não criar telas agora)

Não modelar tudo, mas não travar o schema de forma que impeça:

- Restrição oficial separada de report colaborativo (fonte, vigência, horário, órgão).
- Várias marcações no mesmo ponto, por tipo de veículo.
- Categorias futuras de ocorrência: assalto, acidente, bloqueio, parada segura (documento de segurança).
- Planos de usuário (free / premium) sem implementar cobrança.

---

## 6. Regras de restrição e piloto de dados

Limites nacionais citados (DENATRAN, CONTRAN, PRF), para validação e alerta — não como substituto do cadastro do veículo:

| Dimensão | Máximo nacional citado |
|---|---|
| Altura | 4,40 m |
| Largura | 2,60 m |
| Comprimento | 19,80 m |

Referências que o cliente quer usar como base, não como integração obrigatória do protótipo:

- Resoluções CONTRAN nº 210/2006 e nº 882/2021
- Base SIAET / DNIT (Autorização Especial de Trânsito — restrições permanentes de rodovias federais)
- DERs e secretarias estaduais (decretos e portarias de carga e horário)
- Prefeituras (zonas urbanas, carga/descarga, pontes)
- PRF, DER-SC, CET-SP
- Diários oficiais
- OpenStreetMap para cruzar dado colaborativo

**Piloto explícito — Barra Velha / SC**

- Viaduto na BR-101 com altura crítica de 4,5 m (DNIT e mídia local).
- SC-401: caminhões acima de 23 t restritos em pico (7h–11h e 16h–20h), fonte Governo de SC.

O PDF diz que esses dados “já podem ser usados como piloto” para teste de bloqueio e redirecionamento. No protótipo, o mínimo útil é conseguir representar esses casos como marcações ou restrições de exemplo, para o mapa não nascer vazio. Ingestão automática de DNIT/DER fica fora da primeira entrega.

---

## 7. Visão de segurança (não é escopo do protótipo)

O PDF trata segurança como pilar de produto, além da restrição de via. Registrar para não perder o norte do cliente.

Riscos que ele quer endereçar no futuro: roubo de carga, violência em parada, golpe de frete, infraestrutura ruim, cansaço, falta de alerta entre motoristas. Cita mais de 13 mil roubos de carga por ano (NTC&Logística).

Funcionalidades recomendadas no material, agrupadas:

- **Física:** pontos seguros avaliados, SOS com localização, modo noturno, incidentes em tempo real, selo “Rota Segura”.
- **Digital:** verificação de perfil, criptografia, antifraude de frete, histórico de viagem. LGPD é citada como requisito de confiança.
- **Rota:** rotas por altura/peso/restrição, alerta de área de roubo, dados de PRF, estatística histórica da rota.
- **Inclusão:** modo seguro feminino, pânico silencioso, comunidade de caminhoneiras, selo “Ponto Amigo da Caminhoneira”.

Parcerias desejadas (não técnicas ainda): PRF, seguradoras, postos/restaurantes, empresas de rastreamento.

Para o setup: no protótipo, cumprir o mínimo de cuidado com dados (senha com hash, só coletar o necessário, localização usada para marcação e mapa). Não prometer SOS, KYC ou modo feminino nesta etapa.

---

## 8. Monetização (visão, não feature)

Caminhos descritos pelo cliente. Nenhum entra no protótipo.

1. Assinatura premium (rotas premium, histórico de tráfego, sem anúncio, suporte).
2. Anúncios programáticos (AdMob ou similar), atrelados a usuários ativos.
3. Mídia direta de transporte, manutenção, peças e postos, com destaque regional.
4. Dados e inteligência de rota para transportadoras e logística.
5. Serviços no app (assistência, seguro por trecho, emergência), com comissão.
6. Marketplace: oficinas e postos com plano mensal de destaque.
7. White label para cooperativas ou regiões.

Implicação de setup: usuários e veículos com dono claro, para no futuro separar plano free e premium sem reescrever o cadastro.

---

## 9. Propriedade e posicionamento

Registro de programa de computador (INPI), no PDF:

- Título: ROTA TRUCKS
- Processo: **BR512025005389-4**
- Criação: 01/09/2025
- Expedição: 04/11/2025
- Titular e autor: Hugo Leonardo Ledoux da Silva
- Validade: 50 anos a partir de 1º de janeiro seguinte a 01/09/2025
- Linguagem declarada: OUTROS (não define stack)
- Hash SHA-256 do programa registrado: `3bb007862fe0286a8779a8ee71fc90c907d36f088a1c0a7355585d1f29110ba7`

O nome do arquivo do certificado cita o processo `BR512020001727-4`. O texto do PDF traz `BR512025005389-4`. Usar o número que está no documento até o cliente confirmar.

Posicionamento que o cliente repete: primeiro app nacional feito só para caminhoneiros, com filtro por tipo de veículo e colaboração. Mercado citado: mais de 2 milhões de autônomos e movimentação anual acima de R$ 500 bilhões. Tratar esses números como claim do cliente, não como dado verificado por nós.

---

## 10. Demandas para o setup

Decisões que este contexto já fecha:

- Produto mobile-first. A tela de referência é o celular, não o desktop.
- Primeira publicação: Web App. Preparar o projeto para evoluir a Android e iOS, sem publicar lojas agora.
- Núcleo: conta, veículo, mapa, filtro por veículo, marcação passa/não passa, perfil.
- Três entidades: usuário, caminhão, ocorrência.
- Localização do dispositivo é obrigatória no mapa e no report.
- Interface simples, poucos passos, erro visível, campo obrigatório marcado.
- Não há backend, mapa, auth nem design system neste repositório ainda. O setup parte do zero.
- Não versionar segredo. Não inventar conta de demonstração com senha no código.

Decisões que o setup precisa tomar (não estão nos PDFs):

- Stack (o briefing antigo cita Adalo; este repo sugere app próprio).
- Provedor de mapa e geocoding.
- Onde persistem usuários, veículos e ocorrências.
- Auth (e-mail/senha basta para o protótipo).
- Como representar “passa / não passa” no mapa (pin, cor, raio).
- Se o piloto Barra Velha entra como seed de dados ou fica para depois do fluxo colaborativo.
- Assets de marca (logo, cores). Pedir ao cliente se não existirem fora destes PDFs.
- Confirmar taxonomia de veículos: sprint (5 tipos) vs apresentação (inclui 9 eixos).

Ordem sugerida, alinhada ao sprint do cliente:

1. Projeto, navegação, login e cadastro.
2. Cadastro e vínculo do veículo.
3. Mapa e localização, com marcações.
4. Filtro pelo veículo cadastrado.
5. Reportar ocorrência.
6. Perfil, erros, visual mobile, ajustes.
7. Validação dos fluxos e preparação do Web App.

---

## 11. Fora do primeiro setup

- Publicação Android e iOS.
- Roteirização com desvio automático.
- Ingestão de DNIT, DER, Diário Oficial ou OSM.
- SOS, pontos seguros, modo feminino, KYC, antifraude de frete.
- Planos pagos, anúncios, marketplace, white label.
- Vídeo institucional (o PDF só traz roteiro de marketing).

---

## 12. Critério de pronto do protótipo

O cliente considera o protótipo válido quando estes fluxos funcionam de ponta a ponta no celular (Web App):

- Criar conta e entrar.
- Cadastrar um caminhão com tipo e dimensões e associá-lo ao usuário.
- Ver o mapa na localização atual, com marcações da comunidade.
- Ver só o que importa para aquele tipo de caminhão, com passa e não passa distinguíveis.
- Registrar uma ocorrência com GPS, status e observação, e ela persistir.
- Abrir perfil com dados básicos e navegar entre as áreas sem beco sem saída.
