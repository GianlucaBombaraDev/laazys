import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export const PREVIEW_BASE = '/__laazys_preview/'
const VIRTUAL_ID = 'virtual:laazys-preview'
const CONFIG_FILES = ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'].map((extension) => `vite.config.${extension}`)

type ViteDevServer = {
    middlewares: (req: any, res: any, next: () => void) => void
    transformIndexHtml: (url: string, html: string) => Promise<string>
    close: () => Promise<void>
}

export type Preview = { enabled: true; server: ViteDevServer } | { enabled: false; reason: string }

/** Closest folder at or above `dir` that has a package.json */
export function findProjectRoot(dir: string): string | null {
    let current = path.resolve(dir)
    while (!fs.existsSync(path.join(current, 'package.json'))) {
        const parent = path.dirname(current)
        if (parent === current) return null
        current = parent
    }
    return current
}

/** Installed package folder, looked up like Node does: node_modules of root, then of each parent */
export function findPackageDir(root: string, name: string): string | null {
    let current = root
    while (!fs.existsSync(path.join(current, 'node_modules', name, 'package.json'))) {
        const parent = path.dirname(current)
        if (parent === current) return null
        current = parent
    }
    return path.join(current, 'node_modules', name)
}

/** ESM entry of a package.json, across the "exports" shapes used by Vite and its plugins over time */
export function esmEntry(pkg: any): string {
    const root = pkg.exports?.['.'] ?? pkg.exports
    if (typeof root === 'string') return root
    const entry = root?.import ?? root?.default
    if (typeof entry === 'string') return entry
    return entry?.default ?? pkg.module ?? pkg.main
}

async function importPackage(dir: string) {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    return import(pathToFileURL(path.join(dir, esmEntry(pkg))).href)
}

const fsUrl = (file: string) => `/@fs/${file.replace(/\\/g, '/').replace(/^\//, '')}`

/** Vite plugin providing the module that mounts a component in the preview page */
export function previewPlugin(setupFile?: string) {
    const setupImport = setupFile
        ? `import setup from ${JSON.stringify(fsUrl(path.resolve(process.cwd(), setupFile)))}`
        : 'const setup = () => {}'

    return {
        name: 'laazys-preview',
        resolveId: (id: string) => (id === VIRTUAL_ID ? `\0${VIRTUAL_ID}` : null),
        load: (id: string) =>
            id === `\0${VIRTUAL_ID}`
                ? `import { createApp, h } from 'vue'
${setupImport}

function report() {
    parent.postMessage({ type: 'laazys-preview-size', height: document.documentElement.scrollHeight }, '*')
}

function showError(error) {
    const pre = document.createElement('pre')
    pre.className = 'laazys-error'
    pre.textContent = String((error && error.stack) || error)
    document.body.replaceChildren(pre)
    report()
}

export async function renderPreview(Component, props, slots) {
    try {
        const slotContent = Object.fromEntries(
            slots.map((name) => [name, () => h('span', { class: 'laazys-slot' }, name)]),
        )
        const app = createApp({ render: () => h(Component, props, slotContent) })
        app.config.errorHandler = showError
        await setup(app)
        app.mount('#app')
    } catch (error) {
        showError(error)
    }
    new ResizeObserver(report).observe(document.body)
}
`
                : null,
    }
}

/**
 * Start the project's own Vite in middleware mode, so components are compiled with the project's
 * config, aliases, plugins and CSS. Returns why the preview is disabled when that isn't possible.
 */
export async function createPreview(projectDir: string, setupFile?: string): Promise<Preview> {
    const disabled = (reason: string): Preview => ({ enabled: false, reason })

    const root = findProjectRoot(projectDir)
    if (!root) return disabled('No package.json found for the documented folder')

    const viteDir = findPackageDir(root, 'vite')
    if (!viteDir) return disabled('Vite is not installed in the project')

    const plugins: unknown[] = [previewPlugin(setupFile)]
    const configFile = CONFIG_FILES.map((file) => path.join(root, file)).find((file) => fs.existsSync(file))
    // Without a config file, Vue support has to come from the project's own plugin
    const vuePluginDir = configFile ? null : findPackageDir(root, '@vitejs/plugin-vue')
    if (!configFile && !vuePluginDir) return disabled('No vite.config file and @vitejs/plugin-vue is not installed')

    try {
        if (vuePluginDir) plugins.unshift((await importPackage(vuePluginDir)).default())
        const vite = await importPackage(viteDir)
        const server = await vite.createServer({
            root,
            base: PREVIEW_BASE,
            configFile: configFile ?? false,
            appType: 'custom',
            logLevel: 'error',
            server: { middlewareMode: true, hmr: false },
            plugins,
        })
        return { enabled: true, server }
    } catch (error) {
        return disabled(`Vite could not start: ${(error as Error).message}`)
    }
}

// Escape "<" so JSON from JSDoc can't close the inline <script>
const inlineJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

const PLACEHOLDERS: Record<string, (name: string) => unknown> = {
    string: (name) => name,
    number: () => 0,
    boolean: () => false,
    array: () => [],
    object: () => ({}),
}

/** Values for required props without a default, so the component can render; @previewProps wins */
export function previewProps(file: any) {
    const props: Record<string, unknown> = {}
    for (const prop of file.props ?? []) {
        const type = prop.type?.name
        if (!prop.required || prop.defaultValue || !(type in PLACEHOLDERS)) continue
        props[prop.name] = PLACEHOLDERS[type](prop.name)
    }
    return { ...props, ...file.previewProps }
}

export function previewHtml(file: any) {
    const slots = (file.slots ?? []).map((slot: { name: string }) => slot.name)

    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <style>
            body { margin: 0; padding: 16px; }
            .laazys-slot { display: inline-block; padding: 2px 8px; border: 1px dashed #9ca3af; color: #6b7280; font: 12px sans-serif; }
            .laazys-error { margin: 0; color: #b91c1c; font: 12px monospace; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div id="app"></div>
        <script type="module">
            import { renderPreview } from '${VIRTUAL_ID}'
            import Component from '${fsUrl(file.path)}'
            renderPreview(Component, ${inlineJson(previewProps(file))}, ${inlineJson(slots)})
        </script>
    </body>
</html>`
}
