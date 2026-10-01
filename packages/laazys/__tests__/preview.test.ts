import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
    PREVIEW_BASE,
    createPreview,
    esmEntry,
    findPackageDir,
    findProjectRoot,
    previewHtml,
    previewPlugin,
    previewProps,
} from '../utils/preview'

let tmp: string

const write = (relativePath: string, content: string) => {
    const file = path.join(tmp, relativePath)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
    return file
}

// A minimal ESM package; `body` is the module source
const fakePackage = (project: string, name: string, body: string) => {
    write(`${project}/node_modules/${name}/package.json`, JSON.stringify({ name, exports: './index.js' }))
    write(`${project}/node_modules/${name}/index.js`, body)
}

const FAKE_VITE = `export async function createServer(options) {
    globalThis.__viteOptions = options
    if (options.root.includes('broken')) throw new Error('bad config')
    return { fake: true }
}`
const FAKE_VUE_PLUGIN = `export default () => ({ name: 'fake-vue' })`

beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'laazys-preview-'))
})

afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
})

afterEach(() => {
    delete (globalThis as any).__viteOptions
})

describe('findProjectRoot', () => {
    it('returns the closest folder with a package.json', () => {
        write('app/package.json', '{}')
        fs.mkdirSync(path.join(tmp, 'app/src/components'), { recursive: true })

        expect(findProjectRoot(path.join(tmp, 'app/src/components'))).toBe(path.join(tmp, 'app'))
    })

    it('returns null when there is none up to the filesystem root', () => {
        expect(findProjectRoot('/')).toBeNull()
    })
})

describe('findPackageDir', () => {
    it('looks in node_modules of the folder and of its parents', () => {
        write('mono/node_modules/vite/package.json', '{}')
        fs.mkdirSync(path.join(tmp, 'mono/packages/web'), { recursive: true })

        expect(findPackageDir(path.join(tmp, 'mono/packages/web'), 'vite')).toBe(
            path.join(tmp, 'mono/node_modules/vite'),
        )
    })

    it('returns null for a package that is not installed', () => {
        expect(findPackageDir(tmp, 'not-installed-package')).toBeNull()
    })
})

describe('esmEntry', () => {
    it.each([
        ['a string export', { exports: './a.js' }, './a.js'],
        ['a "." string export', { exports: { '.': './b.js' } }, './b.js'],
        ['an import condition', { exports: { '.': { import: './c.mjs', require: './c.cjs' } } }, './c.mjs'],
        [
            'a nested import condition',
            { exports: { '.': { import: { types: './d.d.ts', default: './d.mjs' } } } },
            './d.mjs',
        ],
        ['a default condition', { exports: { '.': { default: './e.js' } } }, './e.js'],
        ['the module field', { module: './f.mjs', main: './f.cjs' }, './f.mjs'],
        ['the main field', { main: './g.js' }, './g.js'],
    ])('reads %s', (label, pkg, expected) => {
        expect(esmEntry(pkg)).toBe(expected)
    })
})

describe('previewProps', () => {
    it('fills required props without a default with a placeholder of their type', () => {
        const file = {
            props: [
                { name: 'label', required: true, type: { name: 'string' } },
                { name: 'count', required: true, type: { name: 'number' } },
                { name: 'open', required: true, type: { name: 'boolean' } },
                { name: 'items', required: true, type: { name: 'array' } },
                { name: 'config', required: true, type: { name: 'object' } },
                { name: 'onSave', required: true, type: { name: 'func' } },
                { name: 'untyped', required: true },
                { name: 'size', required: true, type: { name: 'string' }, defaultValue: { value: "'md'" } },
                { name: 'title', type: { name: 'string' } },
            ],
        }

        expect(previewProps(file)).toEqual({ label: 'label', count: 0, open: false, items: [], config: {} })
    })

    it('lets @previewProps override the placeholders', () => {
        const file = {
            props: [{ name: 'label', required: true, type: { name: 'string' } }],
            previewProps: { label: 'Save', variant: 'primary' },
        }

        expect(previewProps(file)).toEqual({ label: 'Save', variant: 'primary' })
    })

    it('handles a component without props', () => {
        expect(previewProps({})).toEqual({})
    })
})

describe('previewHtml', () => {
    it('imports the component through Vite and renders it with props and slots', () => {
        const html = previewHtml({
            path: '/project/src/Card.vue',
            props: [{ name: 'title', required: true, type: { name: 'string' } }],
            slots: [{ name: 'default' }, { name: 'footer' }],
        })

        expect(html).toContain("import { renderPreview } from 'virtual:laazys-preview'")
        expect(html).toContain("import Component from '/@fs/project/src/Card.vue'")
        expect(html).toContain('renderPreview(Component, {"title":"title"}, ["default","footer"])')
    })

    it('uses forward slashes for Windows paths', () => {
        expect(previewHtml({ path: 'C:\\project\\Card.vue' })).toContain("from '/@fs/C:/project/Card.vue'")
    })

    it('escapes "<" so JSDoc values cannot close the script tag', () => {
        const html = previewHtml({ path: '/p/Card.vue', previewProps: { label: '</script><img>' } })

        expect(html).not.toContain('</script><img>')
        expect(html).toContain('\\u003c/script>\\u003cimg>')
    })
})

describe('previewPlugin', () => {
    it('resolves and loads only its virtual module', () => {
        const plugin = previewPlugin()

        expect(plugin.resolveId('virtual:laazys-preview')).toBe('\0virtual:laazys-preview')
        expect(plugin.resolveId('vue')).toBeNull()
        expect(plugin.load('\0virtual:laazys-preview')).toContain('export async function renderPreview')
        expect(plugin.load('/src/main.ts')).toBeNull()
    })

    it('calls the setup module when given, resolved from the current directory', () => {
        const withSetup = previewPlugin('setup/preview.js').load('\0virtual:laazys-preview')
        const withoutSetup = previewPlugin().load('\0virtual:laazys-preview')

        expect(withSetup).toContain(`import setup from "/@fs${path.resolve('setup/preview.js')}"`)
        expect(withoutSetup).toContain('const setup = () => {}')
    })
})

describe('createPreview', () => {
    it('is disabled outside a project', async () => {
        expect(await createPreview('/')).toEqual({
            enabled: false,
            reason: 'No package.json found for the documented folder',
        })
    })

    it('is disabled when the project has no Vite', async () => {
        write('no-vite/package.json', '{}')

        expect(await createPreview(path.join(tmp, 'no-vite'))).toEqual({
            enabled: false,
            reason: 'Vite is not installed in the project',
        })
    })

    it('needs the Vue plugin when there is no Vite config', async () => {
        write('no-plugin/package.json', '{}')
        fakePackage('no-plugin', 'vite', FAKE_VITE)

        expect(await createPreview(path.join(tmp, 'no-plugin'))).toEqual({
            enabled: false,
            reason: 'No vite.config file and @vitejs/plugin-vue is not installed',
        })
    })

    it("adds the project's Vue plugin when there is no Vite config", async () => {
        write('plain/package.json', '{}')
        fakePackage('plain', 'vite', FAKE_VITE)
        fakePackage('plain', '@vitejs/plugin-vue', FAKE_VUE_PLUGIN)

        const preview = await createPreview(path.join(tmp, 'plain'))
        const options = (globalThis as any).__viteOptions

        expect(preview).toEqual({ enabled: true, server: { fake: true } })
        expect(options).toMatchObject({
            root: path.join(tmp, 'plain'),
            base: PREVIEW_BASE,
            configFile: false,
            appType: 'custom',
            server: { middlewareMode: true, hmr: false },
        })
        expect(options.plugins.map((plugin: { name: string }) => plugin.name)).toEqual(['fake-vue', 'laazys-preview'])
    })

    it("uses the project's Vite config when there is one", async () => {
        write('configured/package.json', '{}')
        write('configured/vite.config.ts', 'export default {}')
        fakePackage('configured', 'vite', FAKE_VITE)

        await createPreview(path.join(tmp, 'configured'))
        const options = (globalThis as any).__viteOptions

        expect(options.configFile).toBe(path.join(tmp, 'configured', 'vite.config.ts'))
        expect(options.plugins.map((plugin: { name: string }) => plugin.name)).toEqual(['laazys-preview'])
    })

    it('is disabled with the reason when Vite cannot start', async () => {
        write('broken/package.json', '{}')
        write('broken/vite.config.js', 'export default {}')
        fakePackage('broken', 'vite', FAKE_VITE)

        expect(await createPreview(path.join(tmp, 'broken'))).toEqual({
            enabled: false,
            reason: 'Vite could not start: bad config',
        })
    })
})
