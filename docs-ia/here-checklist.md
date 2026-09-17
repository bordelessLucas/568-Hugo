# HERE — checklist (sem chave hoje / ligar amanhã)

## Já pronto no código (sem chave)

- Domínio: `toHereVehicle`, `buildHereRouteSearchParams`, `calculateHereTruckRoute`
- Function: `calculateTruckRoute` (secret `HERE_API_KEY`)
- Fixtures: `@rotatrucks/back` → `FIXTURE_*` / `docs-ia/here-checklist.md`
- Web: Home usa `RouteMap` + estados de rota
- Mobile: client `requestTruckRoute` + path no MockMap
- Avisos na rota: aceitam `path` (polyline); sem path mantém reta
- Camadas de segurança: restrições e pontos seguros usam pins próprios; não alteram o path calculado

## Amanhã, com a chave (ordem)

1. Firebase Console → Project `hugo-3f851` → Functions → Secrets  
   criar / setar `HERE_API_KEY` = chave Router API
2. Deploy:
   ```bash
   cd functions
   npx firebase deploy --only functions --project hugo-3f851
   ```
3. Copiar URL da function `calculateTruckRoute` (região `southamerica-east1`)
4. Web (`.env` na raiz ou `web/.env`):
   ```
   VITE_ROUTE_FUNCTION_URL=https://southamerica-east1-hugo-3f851.cloudfunctions.net/calculateTruckRoute
   ```
5. Mobile (`mobile/.env`):
   ```
   EXPO_PUBLIC_ROUTE_FUNCTION_URL=https://southamerica-east1-hugo-3f851.cloudfunctions.net/calculateTruckRoute
   ```
6. (Opcional tiles) `VITE_HERE_MAPS_API_KEY` — o MVP de rota **não depende** disso; MapLibre + OpenFreeMap já desenha o path.
7. Reiniciar web/mobile e testar: GPS → destino → path / “não passa”.

## Sem chave (dev)

- Sem `VITE_ROUTE_FUNCTION_URL` / `EXPO_PUBLIC_ROUTE_FUNCTION_URL`: status `unavailable` com mensagem amigável.
- Para UI local: `EXPO_PUBLIC_ROUTE_USE_FIXTURE=1` ou `VITE_ROUTE_USE_FIXTURE=1` usa polyline de Barra Velha.

## Observação

Routing (Router API) ≠ Maps (tiles). Prioridade do produto = Router.
