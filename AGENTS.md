# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and UI components.
- `db/`: Drizzle ORM schema, migrations (`db/migrations/`), and seed data (`db/data/`).
- `lib/`: Utilities and shared helpers.
- `public/`: Static assets (images, icons, logo).
- `docs/`: Reference content and background materials.
- Config: `drizzle.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`, `.env.example`.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server at `http://localhost:3000`.
- `pnpm build`: Compile production build.
- `pnpm start`: Run the built app.
- `pnpm lint`: Lint with Next.js + ESLint rules.
- Database: `pnpm db:generate` (generate migrations), `pnpm db:migrate`/`pnpm db:push` (apply schema), `pnpm db:studio` (inspect DB).

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode). React function components.
- Indentation: 2 spaces; prefer early returns and small components.
- Naming: `PascalCase` for components, `camelCase` for vars/functions, `kebab-case` for files/dirs.
- Styling: Tailwind CSS; keep class lists readable and grouped by layout, spacing, color.
- Imports: use path aliases (e.g., `@/app/components/...`, `@/lib/utils`).
- Linting: fix issues via `pnpm lint` and address warnings before PRs.

## Testing Guidelines
- No unit test runner configured yet; prioritize manual verification:
  - Run `pnpm dev` and verify key flows (home, `/stis`, maps, chat).
  - Validate DB changes after `db:migrate`/`db:push` in `db:studio`.
- If adding tests, use `*.test.ts(x)` colocated with source or under `__tests__/`.

## Commit & Pull Request Guidelines
- Commits: concise, imperative, and scoped. Example: `fix: choropleth not rendering Sabah`, `feat(db): add sti_info index`.
- PRs must include:
  - Summary of changes and rationale.
  - Screenshots for UI changes; steps to reproduce/verify.
  - Linked issues (e.g., `Closes #123`).
  - DB notes (migrations/seed impacts) and `.env` updates.

## Security & Configuration Tips
- Configure `DATABASE_URL` in `.env.local` (never commit secrets).
- Check `drizzle.config.ts` paths before generating migrations.
- Avoid committing large data dumps or PII; keep seed data in `db/data/`.

## Agent Instructions
- Keep changes small and well‑scoped; update docs when touching `db/` or `app/components/`.
- Prefer existing patterns and utilities in `@/lib/utils`.
