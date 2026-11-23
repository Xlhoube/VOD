# MEMORY.md — CinePT (`streaming-hub`)

- **Versão actual:** v0.1.0
- **Data de início:** 2026-11-23
- **Objectivo:** Agregador de streaming em Portugal (CinePT) com Next.js, Tailwind CSS, Appwrite e API do TMDB.
- **Stack:** Next.js 16.4.6, React 19.3.0, Tailwind CSS 4.3.3, Lucide React, Appwrite 29.3.1.

## Registo de Decisões
- [2026-11-23] | Auditoria inicial e criação da base de UI/UX | Consolidado o tema escuro cinematográfico em `globals.css`, criado componente `MediaCarousel` com navegação por setas e melhoradas as micro-interacções e acessibilidade em `MediaCard`. | `npm install` apresentou avisos de escrita em disco/cache; validar `npm run build` após conclusão. | Manter `globals.css` alinhado com o tema escuro forçado em `layout.tsx`.
