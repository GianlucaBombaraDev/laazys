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

## Features

- **Zero config:** point it at a folder and it walks every `.vue` and `.js` file in it.
- **Component docs:** props, events and slots are extracted with [vue-docgen-api](https://vue-styleguidist.github.io/docs/Docgen.html), and a ready-to-copy usage snippet is generated for each component.
- **Custom JSDoc tags:** `@description`, `@status`, `@requires`, `@method` and `@provide` (see [Supported tags](#supported-tags)).
- **Composables:** `@method` blocks in `.js` files are documented with their params and return values.
- **Status badges:** components marked `deprecated`, `alpha`, `beta`, `preAlpha`, `inProgress` or `ready` are tagged in the sidebar.

## Installation

Requires **Node.js 22 or later**.

Laazys is published on [GitHub Packages](https://github.com/GianlucaBombaraDev/laazys/packages). GitHub Packages requires authentication even for public packages, so first tell npm where the scope lives and give it a [personal access token](https://github.com/settings/tokens) with the `read:packages` scope:

```ini
# .npmrc (in your project or in your home directory)
@gianlucabombaradev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install it as a dev dependency:

```bash
npm install --save-dev @gianlucabombaradev/laazys
```

## Usage

```bash
npx laazys --path ./src --open
```

| Option | Alias | Required | Description |
| --- | --- | --- | --- |
| `--path` | `-p` | yes | Folder to analyze, relative to the current directory or absolute. `node_modules`, `dist` and hidden folders are skipped. |
| `--open` | `-o` | no | Open the documentation in the browser once the server starts. |

The documentation is served at `http://localhost:3000`, and only on your machine: it isn't reachable from other devices on the network. If the port is busy, the next free one is used. Files are parsed once at startup: restart the command to pick up changes.

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

Props, events and slots don't need any tag: they are read from `defineProps`, `defineEmits` and the template.

### Composables (`.js`)

```js
/**
 * @method useCounter
 * Reactive counter with min/max bounds.
 * @param {number} initial - Starting value.
 * @returns {object} The counter state and its actions.
 */
export function useCounter(initial) {}
```

Only comment blocks that contain a `@method` tag are documented.

## Roadmap

- Watch mode, to refresh the docs while you edit components
- Customizable themes (a dark theme toggle is a work in progress)
- Responsive layout
- TypeScript composables (`.ts`)

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) to set up the project and open a pull request. Everyone taking part is expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

To report a security issue, follow [SECURITY.md](./SECURITY.md) and don't open a public issue.

## License

[MIT](./LICENSE) © Gianluca Bombara
