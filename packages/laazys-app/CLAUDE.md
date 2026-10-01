# packages/laazys-app — SPA

## Commands

Run from this directory:

```bash
pnpm build   # vue-tsc type-check + vite build -> ../laazys/app (what the CLI serves)
pnpm dev     # Vite dev server; /files is fetched from the same origin, so data only shows when served by the CLI
```

`vue-tsc` runs as part of `build` and is the type check for this package. It is stricter in v3: for example, it rejects `v-bind` of an object that may be `null`.

## Tests

`__tests__/` (happy-dom + @vue/test-utils):
- Use `createTestRouter()` from `__tests__/helpers.ts` (real router, memory history, same route names) and a real Pinia. Mock only `axios` or `useFiles`.
- `main.test.ts` boots the real entry point at `/` and `/file/:id` to cover both lazy routes.
- `vitest.config.ts` sets happy-dom's `disableIframePageLoading`: without it, mounting a preview or Figma iframe makes real network requests.
- `EventSource` is replaced with `FakeEventSource` from `helpers.ts` (`vi.stubGlobal`). Use `.emit('update')` to simulate the CLI.

## Architecture

- Routes in `src/main.ts`: `/` (Home, the overview built from `utils/analysis.ts`) and `/file/:id` (File), lazily loaded, history mode.
- `App.vue`:
    - Loads `/files` and `/theme.json`.
    - Listens to `/events` through `useFiles().onFilesUpdate` and reloads the files on each event.
    - Filters the sidebar with `utils/search.ts`.
    - Below `md`, the sidebar is a slide-in menu that closes on navigation.
- `src/composable/useFiles.ts` — fetches `/files` and `/icons.json`. Use absolute paths: relative URLs resolve under `/file/` on nested routes. On error it returns an empty value, never the error object.
- `src/store/file.store.js` (Pinia 4) — `files` and `getCurrentFile(id)`. The selected file comes from `route.params.id`.
- `src/types/file.type.ts` — the file shape emitted by the CLI. Keep it in sync with `_generateList` in `../laazys/utils/get-documentations.ts`.
- File page:
    - `AppComponentPreview` loads `/__laazys_preview/render/:id?revision=N` in an inert, read-only iframe. The frame's height comes from `postMessage` (`laazys-preview-size`), accepted only from its own window. `revision` is bumped on watch-mode reloads so the frame refreshes.
    - `AppFigma` shows `@figma` links only if `utils/figma.ts` accepts them (https on figma.com). The embed loads on demand.
- `@status` values are lowercased before lookup in `AppList.vue`'s `mapStatus`, so its keys must be lowercase.

## Theming

- Colors are `--color-*` CSS variables holding `"R G B"` triplets, defined in `src/index.css` for `:root` (light) and `.dark-theme` (on `<body>`). Use the token utilities (`bg-body`, `bg-surface`, `text-bodyText`, `text-muted`, `border-line`/`bg-line`, `text-primary`), never fixed colors like `bg-white`, or the dark theme breaks.
- `composable/useTheme.ts`: the initial theme is the saved choice (`localStorage`), then `prefers-color-scheme`. `applyCustomTheme` injects the `--theme` colors as an unlayered `<style>`, which overrides the defaults.
- Icons in `public/icons.json` use `fill='currentColor'`, and snippet highlighting uses `--color-code-*`, so both follow the theme.

## Styling (Tailwind 4)

- Loaded via `@tailwindcss/vite`. There is no PostCSS config.
- `src/index.css` does `@import 'tailwindcss'` and pulls theme colors from the v3-style `tailwind.config.js` via `@config`. The colors are CSS variables defined in `src/index.css` (`.dark-theme` overrides).
- A base layer restores the v3 `gray-200` default border color.
- v4 renamed some utilities (`shadow-sm` → `shadow-xs`, `rounded` → `rounded-sm`, `shadow` → `shadow-sm`). Use the v4 names.
