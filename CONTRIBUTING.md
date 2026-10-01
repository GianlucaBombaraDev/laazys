# Contributing to Laazys

Thanks for your interest in Laazys! Bug reports, ideas and pull requests are all welcome.

By taking part you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Reporting bugs and asking for features

Search the [existing issues](https://github.com/GianlucaBombaraDev/laazys/issues) first, then open a new one with the matching template. For bugs, include a minimal `.vue` or `.js` file that reproduces the problem: most bugs are parsing problems, and a sample file is the fastest way to fix them.

Security issues must **not** be reported in public issues: see [SECURITY.md](./SECURITY.md).

## Development setup

Requirements: **Node.js 22+** and **pnpm 12** (the exact version is pinned in `package.json` → `packageManager`; install it with `npm install -g pnpm@12`).

```bash
git clone https://github.com/GianlucaBombaraDev/laazys.git
cd laazys
pnpm install
pnpm build:packages
```

The repository is a pnpm workspace with two packages:

| Package | What it is |
| --- | --- |
| [`packages/laazys`](./packages/laazys) | The published CLI: parses the files and serves the docs (TypeScript, Express) |
| [`packages/laazys-app`](./packages/laazys-app) | The web UI (Vue 3, Vite, Tailwind). It's built into `packages/laazys/app` and shipped inside the CLI, never published on its own |

To try your changes, build the UI first, then the CLI, and run it on the sample files:

```bash
(cd packages/laazys-app && pnpm build)
(cd packages/laazys && pnpm build && node dist/bin/laazys.js -p ./test -o)
```

`packages/laazys/test` contains sample components and composables. If your change affects parsing, add or update a sample there that shows it, and a test fixture in `packages/laazys/__tests__/fixtures/docs`.

## Before opening a pull request

```bash
pnpm lint             # ESLint
pnpm build:packages   # includes the vue-tsc type check of the UI
pnpm test:coverage    # Vitest; fails below 100% coverage
```

All three must pass: CI runs the same commands on every pull request. Coverage is kept at 100% statements, branches, functions and lines, so every change needs tests. Tests live in `packages/*/__tests__/`. If a branch can't be reached by any test, it's usually dead code and can be removed. To run a single file during development, use `npx vitest run <path>`. Code is formatted with Prettier (`npx prettier --write <files>`), and most editors pick up `.prettierrc` and `.editorconfig` automatically.

Keep pull requests focused on one change, and describe what changed and how you tested it. If you change the shape of the data the CLI sends to the UI, update `packages/laazys-app/src/types/file.type.ts` as well.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) with a [gitmoji](https://gitmoji.dev/):

```
<type>(<scope>): :<gitmoji>: <short description>
```

- **Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`
- **Scopes:** `laazys` (CLI), `app` (UI), `types`, `build`, `setup`, `docs`

Examples: `fix(laazys): :bug: fix file paths retrieve`, `feat(app): :sparkles: show provided values`.

## Using an AI coding assistant

The repository includes a [`CLAUDE.md`](./CLAUDE.md) and a `.claude/` folder with project settings for [Claude Code](https://claude.com/claude-code). The settings include a formatting hook and two skills. They only apply if you use that tool, and Claude Code asks you to trust the folder before running them. Contributions made with AI assistance are reviewed like any other: make sure you understand and have tested what you submit.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
