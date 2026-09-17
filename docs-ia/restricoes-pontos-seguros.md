# Restrições e pontos seguros

## Entregue

- Restrições separadas de relatos comunitários.
- Compatibilidade por altura, largura, comprimento, peso, tipo, vigência, dia e horário.
- Janelas que atravessam meia-noite.
- Fontes `verified`, `demo` e `expired`.
- Pontos seguros com serviços, audiência, nota e quantidade de avaliações.
- Selo “Ponto Amigo da Caminhoneira” somente para cadastro curado e verificado com banheiro, chuveiro, iluminação e vigilância.
- Pins distintos no mapa e lista de pontos seguros no mobile e no web.

## Firestore

Coleções `officialRestrictions` e `safePlaces` são legíveis pelo cliente e não aceitam criação, alteração ou exclusão pelo aplicativo. Cadastros curados devem ser feitos por processo administrativo.

Uma restrição verificada exige órgão, URL HTTPS e data de verificação. Registros de demonstração não podem ser apresentados como fonte oficial.

## Limites atuais

- Não há ingestão automática de DNIT, DER ou prefeituras.
- Não há recálculo automático de rota.
- Avaliações são apenas um resumo curado; usuários ainda não publicam avaliações.
- Pontos seguros não são garantia de segurança. As condições podem mudar e devem ser confirmadas antes da parada.
- Os seeds são fictícios e usam nomes naturais para testar o fluxo. Nos detalhes, sempre aparecem como “Dado simulado para teste” e não representam estabelecimentos reais.

## Experiência ampliada

- Busca por nome ou endereço.
- Filtros de segurança, chuveiro, alimentação e pernoite.
- Ordenação por distância, nota ou quantidade de estrutura.
- Detalhes expansíveis com endereço, horário, origem do dado e alerta para confirmar as condições.
- Quando o modo seguro feminino está ativo, a lista prioriza somente pontos recomendados para caminhoneiras sem publicar essa preferência.
