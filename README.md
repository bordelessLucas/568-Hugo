# 568-Hugo

RotaTrucks em três pastas, no mesmo projeto.

- `web` — Web App (Vite, React, TypeScript, Tailwind)
- `mobile` — app Expo Router, preparado para EAS Development Build
- `back` — tokens visuais, domínio e serviços Firebase usados pelos dois

O web autentica, cadastra o caminhão e abre o mapa. O Expo ainda não consome o mesmo fluxo.

```bash
npm run dev:web
npm run dev:mobile
```
