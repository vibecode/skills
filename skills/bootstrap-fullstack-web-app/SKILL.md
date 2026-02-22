---
name: bootstrap-fullstack-web-app
description: >
  Bootstrap a fullstack web application with a Vite + React frontend and Hono + Bun backend.
  Use when the user wants to: create a new web app, start a new project, scaffold a fullstack app,
  set up a React frontend with a backend API, or bootstrap a project from scratch. The stack is
  opinionated: React 18, Vite, React Router v6, React Query, Tailwind CSS v3, shadcn/ui, Hono,
  Bun, and Zod. Triggers: "new web app", "bootstrap project", "scaffold app", "create fullstack",
  "start a new project", "set up a web app".
---

# Bootstrap Fullstack Web App

Scaffold a fullstack monorepo with a Vite + React frontend (`webapp/`) and a Hono + Bun backend (`backend/`).

## Workflow

### 1. Create the project root

```bash
mkdir -p <project-name>/{webapp,backend}
```

### 2. Scaffold the frontend

```bash
cd <project-name>/webapp
bun create vite . --template react-swc-ts
```

Accept overwrite prompts. Then install the app dependencies:

```bash
bun add react-router-dom@^6.30 @tanstack/react-query@^5 \
  framer-motion@^12 lucide-react@^0.462 \
  react-hook-form@^7 @hookform/resolvers@^3 \
  zod@^3 sonner@^1 date-fns@^3 recharts@^2 \
  next-themes@^0.3 class-variance-authority@^0.7 clsx@^2 \
  tailwind-merge@^2 tailwindcss-animate@^1 vaul@^0.9 \
  cmdk@^1 embla-carousel-react@^8 input-otp@^1 \
  react-day-picker@^8 react-resizable-panels@^2
```

Install dev dependencies:

```bash
bun add -d tailwindcss@^3 postcss autoprefixer \
  @tailwindcss/typography @types/node
```

### 3. Set up Tailwind

```bash
bunx tailwindcss init -p --ts
```

Then replace `tailwind.config.ts` with the shadcn/ui-compatible config. See [references/source-files.md](references/source-files.md#tailwindconfigts) for exact contents.

### 4. Set up shadcn/ui

Write `components.json` to configure shadcn. See [references/source-files.md](references/source-files.md#componentsjson).

Then init and add all components:

```bash
bunx shadcn@latest init --yes
bunx shadcn@latest add --all
```

### 5. Write custom frontend files

These files are opinionated and must be written manually. See [references/source-files.md](references/source-files.md) for exact contents:

- `src/index.css` — CSS variables for the design system (HSL colors, dark theme)
- `src/main.tsx` — React entry point
- `src/App.tsx` — Provider wrapper (QueryClient, Router, Toasts, Tooltips)
- `src/lib/api.ts` — API client that auto-unwraps `{ data: T }` response envelope
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/pages/NotFound.tsx` — 404 catch-all page
- `index.html` — Update title and meta tags

Update `vite.config.ts` to set port 8000 and path alias `@/ → ./src/`. See [references/source-files.md](references/source-files.md#viteconfigts).

Update `tsconfig.json` to add path alias. See [references/source-files.md](references/source-files.md#webapp-tsconfigjson).

### 6. Set up the backend

```bash
cd <project-name>/backend
bun init -y
```

Install dependencies:

```bash
bun add hono@^4 @hono/node-server@^1 zod@^4
```

Write the backend files. See [references/source-files.md](references/source-files.md) for exact contents:

- `src/index.ts` — Hono app with CORS, logger, health check, route mounting
- `src/env.ts` — Zod-based environment variable validation
- `src/routes/sample.ts` — Sample route returning `{ data: { message, timestamp } }`
- `tsconfig.json` — Backend TypeScript config

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "start": "bun run src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### 7. Create `.env` files

**`webapp/.env`:**
```
VITE_BACKEND_URL=http://localhost:3000
```

**`backend/.env`:**
```
PORT=3000
```

### 8. Verify

```bash
# Terminal 1
cd backend && bun run dev

# Terminal 2
cd webapp && bun run dev
```

- Backend: http://localhost:3000/health should return `{ "status": "ok" }`
- Frontend: http://localhost:8000 should load the app

## API Contract

All backend routes return `{ data: T }`. The frontend `api.ts` auto-unwraps this:

```typescript
// Backend
c.json({ data: posts })

// Frontend — returns Post[], not { data: Post[] }
api.get<Post[]>("/api/posts")
```

Errors return `{ error: { message, code } }` with appropriate status code.

## Adding Routes

**Backend:** Create `src/routes/foo.ts`, export a Hono router, mount in `src/index.ts` via `app.route("/api/foo", fooRouter)`.

**Frontend:** Create `src/pages/Foo.tsx`, import in `App.tsx`, add `<Route path="/foo" element={<Foo />} />` above the catch-all.

## Notes

- All API endpoints must be prefixed with `/api/`
- Use React Query (`useQuery`, `useMutation`) for all server state
- Use shadcn/ui components first before building custom UI
- Path alias `@/` maps to `./src/` in the frontend
