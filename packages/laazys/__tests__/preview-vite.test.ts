import path from 'path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createPreview } from '../utils/preview'
import { DocsState, createApp } from '../utils/server'
import type { Preview } from '../utils/preview'

// Integration test with the real Vite and Vue plugin installed in this repository
const PROJECT = path.join(__dirname, 'fixtures', 'preview-project')
const component = {
    id: 'hello',
    name: 'Hello',
    extension: 'vue',
    path: path.join(PROJECT, 'src', 'Hello.vue'),
    props: [{ name: 'name', required: true, type: { name: 'string' } }],
}
let preview: Preview

beforeAll(async () => {
    preview = await createPreview(path.join(PROJECT, 'src'), path.join(PROJECT, 'setup.js'))
}, 30_000)

afterAll(async () => {
    if (preview.enabled) await preview.server.close()
})

describe('preview with the project Vite', () => {
    it('starts', () => {
        expect(preview.enabled).toBe(true)
    })

    it('serves a page that renders the component and compiles the component itself', async () => {
        const app = createApp(new DocsState([component]), PROJECT, { preview })

        const page = await request(app).get('/__laazys_preview/render/hello')
        expect(page.status).toBe(200)
        expect(page.type).toBe('text/html')
        // Vite moves the inline script to a proxy module and injects nothing else for appType "custom"
        const proxy = page.text.match(/src="([^"]+html-proxy[^"]+)"/)![1]

        const entry = await request(app).get(proxy)
        expect(entry.text).toContain('renderPreview(Component, {"name":"name"}, [])')

        const compiled = await request(app).get(`/__laazys_preview/@fs${component.path}`)
        expect(compiled.status).toBe(200)
        expect(compiled.text).toContain('Hello ')
    })

    it('serves the virtual module with the setup file', async () => {
        const app = createApp(new DocsState([component]), PROJECT, { preview })

        const virtual = await request(app).get('/__laazys_preview/@id/__x00__virtual:laazys-preview')

        expect(virtual.status).toBe(200)
        expect(virtual.text).toContain('setup.js')
        expect(virtual.text).toContain('export async function renderPreview')
    })
})
