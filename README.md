# 568-Hugo

RotaTrucks em três pastas, no mesmo projeto.

- `web` — Web App (Vite, React, TypeScript, Tailwind)
- `mobile` — app Expo Router
- `back` — domínio e Firebase compartilhados

## Rodar

Na raiz do repositório:

```bash
npm run dev:web
npm run dev:mobile
```

O mobile **precisa** partir da pasta `mobile` (ou do script acima). Não rode `npx expo start` na raiz — isso cria um projeto Expo vazio e quebra com `Unable to resolve ../../App`.

```bash
cd mobile
npm start
```
