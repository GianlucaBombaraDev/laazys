import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios', () => ({ default: { get: vi.fn(async () => ({ data: [] })) } }))

afterEach(() => {
    document.body.innerHTML = ''
    vi.resetModules()
})

async function bootAt(path: string) {
    window.history.replaceState({}, '', path)
    document.body.innerHTML = '<div id="app"></div>'
    await import('../src/main')
    await flushPromises()
    // Lazy routes resolve asynchronously
    await vi.waitFor(() => expect(document.querySelector('#app img')).not.toBeNull())
}

describe('main', () => {
    it('mounts the app on #app and serves the home route', async () => {
        await bootAt('/')

        expect(document.querySelector('#app img')?.getAttribute('alt')).toBe('laazys logo')
        await vi.waitFor(() => expect(document.body.textContent).toContain('sono la home'))
    })

    it('serves the file route', async () => {
        await bootAt('/file/unknown')

        await vi.waitFor(() => expect(document.querySelector('#app .grid-cols-3')).not.toBeNull())
    })
})
