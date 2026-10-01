import fs from 'fs'
import net from 'net'
import os from 'os'
import path from 'path'
import request from 'supertest'
import type { Server } from 'http'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp, startServer } from '../utils/server'

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
    await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))))
})

afterAll(() => {
    fs.rmSync(appDir, { recursive: true, force: true })
})

describe('createApp', () => {
    it('serves the parsed files as JSON', async () => {
        const response = await request(createApp(files, appDir)).get('/files')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(files)
    })

    it('serves the static build of the UI', async () => {
        const response = await request(createApp(files, appDir)).get('/icons.json')

        expect(response.body).toEqual({ sun: '<svg />' })
    })

    it.each(['/', '/file/abc'])('falls back to index.html for %s', async (url) => {
        const response = await request(createApp(files, appDir)).get(url)

        expect(response.status).toBe(200)
        expect(response.text).toBe('<html>app</html>')
    })
})

describe('startServer', () => {
    it('listens on localhost and resolves with the actual port', async () => {
        const { server, port } = await startServer(createApp(files, appDir), 0)
        servers.push(server)

        expect(port).toBeGreaterThan(0)
        expect(server.address()).toMatchObject({ port })
        expect(['127.0.0.1', '::1']).toContain((server.address() as net.AddressInfo).address)
    })

    it('moves to the next port when the requested one is busy', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'log').mockImplementation(() => {})
        const busy = await startServer(createApp(files, appDir), 0)
        servers.push(busy.server)

        const next = await startServer(createApp(files, appDir), busy.port)
        servers.push(next.server)

        expect(next.port).toBe(busy.port + 1)
        expect(console.warn).toHaveBeenCalledWith(`Port ${busy.port} is already in use, trying port ${busy.port + 1}`)
    })

    it('rejects on any other listen error', async () => {
        // 203.0.113.1 is a documentation-only address (RFC 5737): it can't be bound locally
        await expect(startServer(createApp(files, appDir), 0, '203.0.113.1')).rejects.toMatchObject({
            code: 'EADDRNOTAVAIL',
        })
    })
})
