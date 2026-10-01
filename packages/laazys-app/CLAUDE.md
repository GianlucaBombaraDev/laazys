# packages/laazys-app — SPA

## Commands

Run from this directory:

```bash
pnpm build   # vue-tsc type-check + vite build -> ../laazys/app (what the CLI serves)
pnpm dev     # Vite dev server; /files is fetched from the same origin, so data only shows when served by the CLI
```

`vue-tsc` runs as part of `build` and is the type check for this package. It is stricter in v3: for example, it rejects `v-bind` of an object that may be `null`.

## Architecture

- Routes in `src/main.ts`: `/` (Home) and `/file/:id` (File), lazily loaded, history mode.
- `src/composable/useFiles.ts` — fetches `/files` and `/icons.json`. Use absolute paths: relative URLs resolve under `/file/` on nested routes. On error it returns an empty value, never the error object.
- `src/store/file.store.js` (Pinia 4) — `files` and `getCurrentFile(id)`. The selected file comes from `route.params.id`.
- `src/types/file.type.ts` — the file shape emitted by the CLI. Keep it in sync with `_generateList` in `../laazys/utils/get-documentations.ts`.
- `@status` values are lowercased before lookup in `AppList.vue`'s `mapStatus`, so its keys must be lowercase.

## Styling (Tailwind 4)

- Loaded via `@tailwindcss/vite`. There is no PostCSS config.
- `src/index.css` does `@import 'tailwindcss'` and pulls theme colors from the v3-style `tailwind.config.js` via `@config`. The colors are CSS variables defined in `src/index.css` (`.dark-theme` overrides).
- A base layer restores the v3 `gray-200` default border color.
- v4 renamed some utilities (`shadow-sm` → `shadow-xs`, `rounded` → `rounded-sm`, `shadow` → `shadow-sm`). Use the v4 names.
