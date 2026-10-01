<p align="center">
  <img src="./laazys-logo.png" alt="laazys" width="600"/>
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Status: alpha" src="https://img.shields.io/badge/status-alpha-orange.svg">
  <img alt="Node >= 22" src="https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg">
</p>

**Laazys** is a CLI for **Vue.js** developers who want documentation without writing it twice. It reads the JSDoc comments already in your `.vue` components and `.js` composables and serves them as a browsable documentation site.

> **Status: alpha.** The API, the supported tags and the output can change between releases.

## Why Laazys

Writing documentation is hard work and it takes a lot of time. It usually ends up in separate files (a wiki, a docs folder, a Storybook) that live away from the code. Nobody reads them, and nobody updates them when the code changes, so they drift out of date.

Laazys embraces a **documentation-as-code** approach: the documentation lives *inside* the code it describes, as JSDoc comments next to the props, events and functions they explain. It's written while you write the component, reviewed in the same pull request, and updated in the same commit that changes the behavior. You don't have to keep a second source of truth in sync.

What you get:

- **Docs where the code is:** nothing to write twice and no extra files to maintain. If a component changes, its documentation is right there to update.
- **Data that comes from the code itself:** props, events and slots are read from your components, so they're always accurate even when nobody wrote a comment.
- **A UI to explore and analyze it:** Laazys turns those comments into a browsable site. You can search across every component and composable, read their API and status, copy a usage snippet, and see at a glance what is deprecated or still undocumented.

## Features

- **Zero config:** point it at a folder and it walks every `.vue`, `.js` and `.ts` file in it.
- **Component docs:** props, events and slots are extracted with [vue-docgen-api](https://vue-styleguidist.github.io/docs/Docgen.html), and a ready-to-copy usage snippet is generated for each component.
- **Custom JSDoc tags:** `@description`, `@status`, `@requires`, `@method` and `@provide` (see [Supported tags](#supported-tags)).
- **Composables in JavaScript and TypeScript:** `@method` blocks in `.js` and `.ts` files are documented with their params and return values.
- **Search:** filter the sidebar by name, description, props, events, slots or methods.
- **Overview and analysis:** the home page counts components and composables, groups components by status, and lists deprecated components, components without a description and methods without a description.
- **Live component preview:** each component is rendered, read-only, with your project's own Vite setup (see [Component preview](#component-preview)).
- **Figma links:** link a component to its design with `@figma` and open or embed it from the docs.
- **Status badges:** components marked `deprecated`, `alpha`, `beta`, `preAlpha`, `inProgress` or `ready` are tagged in the sidebar.
- **Watch mode:** with `--watch`, the docs are regenerated when a file changes and open pages refresh by themselves.
- **Light and dark themes:** follows the system preference, remembers your choice, and the colors can be customized with `--theme`.
- **Responsive:** on small screens the sidebar becomes a slide-in menu.

## Installation

Requires **Node.js 22 or later**.

Laazys is published on [GitHub Packages](https://github.com/GianlucaBombaraDev/laazys/packages). GitHub Packages requires authentication even for public packages. Create a [personal access token](https://github.com/settings/tokens) with the `read:packages` scope, then tell your package manager where the scope lives. npm and pnpm both read the same file, the `.npmrc` **in your home directory**:

```ini
# ~/.npmrc
@gianlucabombaradev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`${GITHUB_TOKEN}` is read from the environment (`export GITHUB_TOKEN=...`), so the token is never written in a file.

> Keep the token line in `~/.npmrc`, not in your project's `.npmrc`. Since 10.34.2 / 11.5.3, pnpm doesn't expand environment variables in a repository's `.npmrc`: a committed file could otherwise send your secrets to another registry ([details](https://pnpm.io/blog/2026/06/11/env-variables-in-repository-npmrc)). The `registry` line holds no secret and can also live in the project's `.npmrc`.

Then install it as a dev dependency with your package manager:

```bash
# npm
npm install --save-dev @gianlucabombaradev/laazys

# pnpm
pnpm add --save-dev @gianlucabombaradev/laazys
```

## Usage

```bash
# npm
npx laazys --path ./src --open

# pnpm
pnpm exec laazys --path ./src --open
```

| Option | Alias | Required | Description |
| --- | --- | --- | --- |
| `--path` | `-p` | yes | Folder to analyze, relative to the current directory or absolute. `node_modules`, `dist` and hidden folders are skipped. |
| `--open` | `-o` | no | Open the documentation in the browser once the server starts. |
| `--watch` | `-w` | no | Regenerate the docs when a `.vue`, `.js` or `.ts` file changes. Open pages update without a reload. |
| `--theme` | `-t` | no | JSON file with custom colors, see [Custom theme](#custom-theme). |
| `--no-preview` | | no | Don't render the component previews. |
| `--preview-setup` | | no | Module that prepares the Vue app of each preview, see [Component preview](#component-preview). |

You can also add it to the `scripts` of your `package.json` and run it with `npm run docs` or `pnpm run docs`. Use `run`: `npm docs` and `pnpm docs` are built-in commands that open a package's homepage.

```json
{
    "scripts": {
        "docs": "laazys --path ./src --open"
    }
}
```

The documentation is served at `http://localhost:3000`, and only on your machine: it isn't reachable from other devices on the network. If the port is busy, the next free one is used. Without `--watch`, files are parsed once at startup: restart the command to pick up changes.

### Custom theme

Pass a JSON file with `--theme` to change the colors of the light theme, the dark theme or both. Every key is optional, and colors are hex values:

```json
{
    "light": { "primary": "#0f766e", "accent": "#5eead4" },
    "dark": { "body": "#020617", "surface": "#0f172a" }
}
```

| Color | Used for |
| --- | --- |
| `body` | Page background |
| `surface` | Sidebar and cards |
| `body-text` | Text |
| `muted` | Secondary text (paths, counters) |
| `line` | Borders |
| `primary` | Links and highlights |
| `accent` | Selected theme button |

The file is validated at startup: an unknown color, mode or a value that isn't a hex color stops the command with an error that names it.

### Component preview

Every component page shows a read-only rendering of the component. Laazys starts **your project's Vite** with your `vite.config` (aliases, plugins, CSS), so components look the same as in your app. Each preview runs in its own frame: an error in one component shows up in its frame without affecting the rest.

Requirements: Vite and Vue installed in the project, plus a `vite.config` file or `@vitejs/plugin-vue`. When they're missing, the page explains why and the rest of the docs works as usual. Use `--no-preview` to skip it.

- **Props:** required props without a default get a placeholder of their type (the prop name for strings, `0`, `false`, `[]`, `{}`). Pass realistic values with `@previewProps` (see [Supported tags](#supported-tags)).
- **Slots:** each documented slot shows a dashed box with its name.
- **Plugins and global CSS:** components that need a router, a store, i18n or global styles can get them from a setup module, passed with `--preview-setup`:

```js
// laazys.preview.js
import { createPinia } from 'pinia'
import './src/assets/main.css'

export default (app) => {
    app.use(createPinia())
}
```

```bash
npx laazys --path ./src --preview-setup ./laazys.preview.js
```

## Supported tags

### Components (`.vue`)

```vue
<script setup>
import { provide, reactive } from 'vue'

/**
 * @description A button that triggers the primary action of a form,
 * across multiple lines if needed.
 * @status beta
 * @requires FormProvider.vue
 * @figma https://www.figma.com/design/AbC123/Forms?node-id=12-34
 * @previewProps {"disabled": false}
 */

defineProps({ disabled: { type: Boolean, default: false } })
defineEmits(['submit'])

/**
 * @method reset
 * Clears the form state.
 * @param {boolean} keepDefaults - Whether to restore default values.
 * @returns {void}
 */
function reset(keepDefaults) {}

const formState = reactive({})

/**
 * @provide form|formState
 */
provide('form', formState)
</script>
```

| Tag | Shown as |
| --- | --- |
| `@description` | Component description (can span multiple lines) |
| `@status` | Badge in the sidebar: `deprecated`, `alpha`, `beta`, `preAlpha`, `inProgress`, `ready` |
| `@requires` | "Requires" note in the component header |
| `@method` + `@param` / `@returns` | Entry in the component's methods |
| `@provide` | What the component provides. Included in the parsed data, not shown in the UI yet |
| `@figma` | Link to the design, with an "Open in Figma" button and an embed loaded on demand. Only `https://` links on `figma.com` are accepted |
| `@previewProps` | Props for the [component preview](#component-preview), as a JSON object on one line |

Props, events and slots don't need any tag: they are read from `defineProps`, `defineEmits` and the template.

### Composables (`.js` and `.ts`)

```js
/**
 * @method useCounter
 * Reactive counter with min/max bounds.
 * @param {number} initial - Starting value.
 * @returns {object} The counter state and its actions.
 */
export function useCounter(initial) {}
```

TypeScript files work the same way. Only comment blocks that contain a `@method` tag are documented, and files without any (types, constants, helpers) are left out of the list. Type declaration files (`.d.ts`) are skipped.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) to set up the project and open a pull request. Everyone taking part is expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

To report a security issue, follow [SECURITY.md](./SECURITY.md) and don't open a public issue.

## License

[MIT](./LICENSE) © Gianluca Bombara
