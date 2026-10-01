import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FakeEventSource } from './helpers'

vi.mock('axios', () => ({ default: { get: vi.fn(async () => ({ data: [] })) } }))

beforeEach(() => {
    vi.stubGlobal('EventSource', FakeEventSource)
})

afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.resetModules()
})

async function bootAt(path: string) {
    window.history.replaceState({}, '', path)
    document.body.innerHTML = '<div id="app"></div>'
    await import('../src/main')
    await flushPromises()
    // Lazy routes resolve asynchronously
    await vi.waitFor(() => expect(document.querySelector('#app img[alt="laazys logo"]')).not.toBeNull())
}

describe('main', () => {
    it('mounts the app on #app and serves the home route', async () => {
        await bootAt('/')

        await vi.waitFor(() => expect(document.querySelector('main h1')?.textContent).toBe('Panoramica'))
    })

    it('serves the file route', async () => {
        await bootAt('/file/unknown')

        await vi.waitFor(() => expect(document.querySelector('#app main .lg\\:grid-cols-3')).not.toBeNull())
    })
})
