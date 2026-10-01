import fs from 'fs'
import net from 'net'
import os from 'os'
import path from 'path'
import request from 'supertest'
import type { Server } from 'http'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DocsState, createApp, startServer } from '../utils/server'

let appDir: string
const files = [{ id: 'abc', name: 'Button' }]
const servers: Server[] = []

beforeAll(() => {
    appDir = fs.mkdtempSync(path.join(os.tmpdir(), 'laazys-app-'))
    fs.writeFileSync(path.join(appDir, 'index.html'), '<html>app</html>')
    fs.writeFileSync(path.join(appDir, 'icons.json'), '{"sun":"<svg />"}')
})

afterEach(async () => {
    vi.restoreAllMocks()
    await Promise.all(
        servers.splice(0).map((server) => {
            server.closeAllConnections()
            return new Promise((resolve) => server.close(resolve))
        }),
    )
})

afterAll(() => {
    fs.rmSync(appDir, { recursive: true, force: true })
})

describe('createApp', () => {
    it('serves the parsed files as JSON', async () => {
        const response = await request(createApp(new DocsState(files), appDir)).get('/files')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(files)
    })

    it('serves the static build of the UI', async () => {
        const response = await request(createApp(new DocsState(files), appDir)).get('/icons.json')

        expect(response.body).toEqual({ sun: '<svg />' })
    })

    it.each(['/', '/file/abc'])('falls back to index.html for %s', async (url) => {
        const response = await request(createApp(new DocsState(files), appDir)).get(url)

        expect(response.status).toBe(200)
        expect(response.text).toBe('<html>app</html>')
    })
})

describe('createApp extras', () => {
    it('serves an empty theme by default and the given one otherwise', async () => {
        expect((await request(createApp(new DocsState(files), appDir)).get('/theme.json')).body).toEqual({})

        const theme = { dark: { primary: '1 2 3' } }
        expect((await request(createApp(new DocsState(files), appDir, theme)).get('/theme.json')).body).toEqual(theme)
    })

    it('serves the latest files after an update', async () => {
        const state = new DocsState(files)
        const app = createApp(state, appDir)

        state.update([{ id: 'new' }])

        expect((await request(app).get('/files')).body).toEqual([{ id: 'new' }])
    })

    it('pushes an update event to connected pages and forgets them on disconnect', async () => {
        const state = new DocsState(files)
        const { server, port } = await startServer(createApp(state, appDir), 0)
        servers.push(server)

        const controller = new AbortController()
        const response = await fetch(`http://localhost:${port}/events`, { signal: controller.signal })
        expect(response.headers.get('content-type')).toContain('text/event-stream')
        await vi.waitFor(() => expect(state.listenerCount('update')).toBe(1))

        state.update([])
        const reader = response.body!.getReader()
        const { value } = await reader.read()
        expect(new TextDecoder().decode(value)).toBe('event: update\ndata: {}\n\n')

        controller.abort()
        await vi.waitFor(() => expect(state.listenerCount('update')).toBe(0))
    })
})

describe('startServer', () => {
    it('listens on localhost and resolves with the actual port', async () => {
        const { server, port } = await startServer(createApp(new DocsState(files), appDir), 0)
        servers.push(server)

        expect(port).toBeGreaterThan(0)
        expect(server.address()).toMatchObject({ port })
        expect(['127.0.0.1', '::1']).toContain((server.address() as net.AddressInfo).address)
    })

    it('moves to the next port when the requested one is busy', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'log').mockImplementation(() => {})
        const busy = await startServer(createApp(new DocsState(files), appDir), 0)
        servers.push(busy.server)

        const next = await startServer(createApp(new DocsState(files), appDir), busy.port)
        servers.push(next.server)

        expect(next.port).toBe(busy.port + 1)
        expect(console.warn).toHaveBeenCalledWith(`Port ${busy.port} is already in use, trying port ${busy.port + 1}`)
    })

    it('rejects on any other listen error', async () => {
        // 203.0.113.1 is a documentation-only address (RFC 5737): it can't be bound locally
        await expect(startServer(createApp(new DocsState(files), appDir), 0, '203.0.113.1')).rejects.toMatchObject({
            code: 'EADDRNOTAVAIL',
        })
    })
})
