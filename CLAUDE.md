# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Laazys generates browsable documentation for Vue.js projects from JSDoc comments in `.vue` and `.js` files. A Node CLI parses the files and serves a Vue SPA that renders them.

## Codebase map

- `packages/laazys/` — the CLI (TypeScript, ESM, Express 5). Parsing + server. See [packages/laazys/CLAUDE.md](packages/laazys/CLAUDE.md).
- `packages/laazys-app/` — the SPA (Vue 3, Vite 8, Pinia, Tailwind 4). See [packages/laazys-app/CLAUDE.md](packages/laazys-app/CLAUDE.md).
- `packages/laazys/test/` — sample `.vue`/`.js` files to document, used for manual runs. Not Jest tests, excluded from lint.
- `.claude/` — shared Claude Code settings, hooks and skills.
- `.github/workflows/` — `ci.yml` runs lint + build on PRs and pushes; `build-deploy.yml` publishes `packages/laazys` to GitHub Packages on release. Only `dist/` and `app/` are published (`files` in its package.json).
- Community docs: `README.md` (user-facing, keep the documented tags and options in sync with the code), `CONTRIBUTING.md`, `SECURITY.md`.

Data flow: CLI parses once at startup → keeps the list in memory → `GET /files` → SPA fetches and renders. The file object shape is the contract between the two packages: `_generateList` in `packages/laazys/utils/get-documentations.ts` ↔ `packages/laazys-app/src/types/file.type.ts`.

## Root commands

Node ≥ 22, pnpm 12 (pinned via `packageManager`; use `npx pnpm@12.8.1` if your global pnpm differs).

```bash
pnpm install
pnpm build:packages   # build both packages
pnpm lint             # ESLint 10 flat config (eslint.config.mjs)
pnpm test             # Vitest, both packages
pnpm test:coverage    # same, enforcing 100% statements/branches/functions/lines (CI runs this)
npx vitest run packages/laazys/__tests__/server.test.ts   # a single file
npx vitest run --project laazys-app -t 'AppList'           # one project, filtered by test name
```

Per-package build/run commands live in each package's CLAUDE.md. To check end-to-end that a change works, use the `verify-docs-output` skill.

## Critical gotchas

- **Build the app before running the CLI.** The CLI serves `packages/laazys/app/`, which is Vite's build output (gitignored). `packages/laazys/app/`, `dist/` and `pnpm-lock.yaml` are generated: don't edit them by hand.
- **pnpm settings live in `pnpm-workspace.yaml`** (`shamefullyHoist`). pnpm ≥ 11 ignores them in `.npmrc`, which only maps the `@gianlucabombaradev` scope to GitHub Packages.
- **TypeScript stays on 6.x.** TS 7 dropped the JS compiler API that `vue-tsc` and `ts-jest` need, and `typescript-eslint` requires < 6.1.
- **Tests:** Vitest 5 with projects (`vitest.config.mts` at the root, one `vitest.config.ts` per package, tests in `packages/*/__tests__/`). Coverage is enforced at 100% on every metric, so new code needs tests, and unreachable branches should be removed rather than excluded.
    - Coverage `include` patterns are relative to the repo root and only work on the full run. With `--project` nothing is collected, so check coverage with `pnpm test:coverage`.
    - Vitest 5 sets `clearMocks: true`: mock calls recorded in `beforeAll` are wiped before each test, so copy them in the hook if a test needs them.
- **Formatting:** Prettier (4 spaces, no semicolons, single quotes, 120 cols, tailwind plugin) runs automatically after each edit via a `.claude/` hook. ESLint has `no-explicit-any` and `ban-ts-comment` off on purpose: the code relies on loosely typed parser output.
