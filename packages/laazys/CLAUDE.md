# packages/laazys — CLI

## Commands

Run from this directory:

```bash
pnpm build                              # tsc -> dist/, then scripts/tsc-fix.js
node dist/bin/laazys.js -p ./test -o    # parse ./test, serve on :3000 (next free port if busy), -o opens the browser
curl -s localhost:3000/files            # inspect the parsed output
```

`-p` is resolved against the current working directory and also accepts absolute paths. `node_modules`, `dist` and dot-directories are skipped while walking.

## Architecture

- `bin/laazys.ts` only calls `run()` from `utils/cli.ts`, which handles the yargs options (`--path`, `--open`, `--watch`, `--theme`), parses, then starts the server.
- `utils/server.ts`:
    - `DocsState` holds the parsed files. `update()` replaces them and emits `'update'`.
    - `createApp` serves `GET /files`, `GET /theme.json`, `GET /events` (Server-Sent Events, one `update` event per regeneration), the built SPA, and a `/{*splat}` fallback to `index.html`.
    - `startServer` binds to `localhost` only, since `/files` exposes source code.
- `utils/watch.ts` — `fs.watch` (recursive), filtered with `isDocumentable`/`isIgnoredDir` from `get-all-files.ts` and debounced. In watch mode the CLI re-runs `getDocumentation` and calls `state.update()`.
- `utils/theme.ts` — validates the `--theme` JSON (modes `light`/`dark`, tokens in `THEME_TOKENS`, hex colors) and converts the colors to `"R G B"` triplets. Keep `THEME_TOKENS` in sync with the `--color-*` variables in `laazys-app/src/index.css`.
- `utils/get-all-files.ts` — recursive walk. `.vue` files are collected as path + source. `.js`/`.ts` files (not `.d.ts`) are fully processed here with `comment-parser`: only blocks with a `@method` tag are kept, and files without any are dropped.
- `utils/get-documentations.ts` — runs each `.vue` file through `vue-docgen-api`. A custom script handler (`_parseList`) scans every JSDoc block for the tags in `tagToParser`. It also builds the usage snippet `sourceCode` from props/events/slots with Prettier's built-in `vue` parser.
- `utils/doc-parser.ts` — regex parsers for the custom tags.

Method shape is the same for both sources: `{ name, description, params, return }`. In Vue files, `@method` blocks are collected as `customMethods` and merged with vue-docgen's own `methods`. `id`s come from `generateRandomHash()` and change on every run.

To add a new custom JSDoc tag, use the `add-jsdoc-tag` skill: the change spans the parser, the output object and the UI.

## Tests

`__tests__/` (Node environment):
- `fixtures/docs/` holds real `.vue`/`.js` files run through vue-docgen. Add a fixture there for new parsing cases, including files that must fail (`Broken.vue`).
- Folder-walking tests build temporary directories, because a `node_modules` fixture would be gitignored.
- The server is tested with supertest and port `0`. `cli-defaults.test.ts` mocks the server so nothing binds the real port 3000.
- Open SSE connections keep `server.close()` waiting: call `server.closeAllConnections()` first.
- `watch.test.ts` captures the `fs.watch` callback to drive exact file names, plus one real-filesystem test. `cli-watch.test.ts` mocks the watcher and the parser.
- `bin/laazys.ts` only calls `run()`. Keep logic out of it: `bin.test.ts` imports it with `run` mocked.

## Gotchas

- **ESM build:** sources use extensionless relative imports, but the package is `"type": "module"` (`moduleResolution: bundler`). `scripts/tsc-fix.js` appends `.js` to relative imports in `dist/`. Keep imports extensionless and always build with `pnpm build`, never bare `tsc`.
- **Express 5:** `app.listen` passes errors (e.g. `EADDRINUSE`) to the callback rather than only emitting `'error'`. Route wildcards need path-to-regexp v8 syntax (`/{*splat}`, not `*`).
- **File names:** `extractFileInfo` normalizes `\` to `/` before `path.parse`, because outputs generated on Windows must still produce bare names.
- **Errors:** a `.vue` file that throws during parsing is logged and skipped, not fatal. A missing file in `/files` usually means an exception in `_generateList` or `_generateSourceCode`, so check the CLI's stderr.
