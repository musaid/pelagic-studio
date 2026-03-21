# Pelagic Studio — Claude Instructions

## Commit Style

- Format: `:sparkles: <message>` (gitmoji prefix)
- Example: `✨ Add depth attenuation model`
- **No Co-Authored-By lines** — never add them

## Working Directory

- Always run Claude from inside this directory (`/Users/musaid/Vault/pelagic-studio`)
- Memories live in `.claude/memory/`

## Stack

- React Router v7 (framework mode, SSR on Cloudflare Workers)
- TypeScript strict — no `any`/`unknown`
- Tailwind CSS v4
- Vite + `@cloudflare/vite-plugin`
- Canvas API + Web Workers for all image processing (client-side only)
- pnpm as package manager

## Conventions

- Functional components only, <200 lines, single responsibility
- Early returns over nested conditions
- No OOP, no class components
- Deploy: `pnpm run build && pnpm exec wrangler deploy`
