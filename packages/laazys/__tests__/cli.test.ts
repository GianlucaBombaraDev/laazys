import path from 'path'
import type { Server } from 'http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import open from 'open'
import { run } from '../utils/cli'

vi.mock('open', () => ({ default: vi.fn() }))

const FIXTURES = path.join(__dirname, 'fixtures', 'docs')
let server: Server | undefined

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(async () => {
    vi.restoreAllMocks()
    await new Promise((resolve) => (server ? server.close(resolve) : resolve(undefined)))
    server = undefined
})

const logs = () =>
    vi
        .mocked(console.log)
        .mock.calls.map((args) => String(args[0]))
        .join('\n')

describe('run', () => {
    it('parses the folder and starts the server', async () => {
        server = await run(['--path', FIXTURES, '--no-preview'], { appDir: FIXTURES, port: 0 })

        const { port } = server.address() as { port: number }
        const response = await fetch(`http://localhost:${port}/files`)
        const files = await response.json()

        expect(files.map((file: any) => file.name)).toContain('Full')
        expect(logs()).toContain(`We are analyzing the files inside`)
        expect(logs()).toContain(`Server is running at`)
        expect(logs()).toContain(`http://localhost:${port}`)
        expect(open).not.toHaveBeenCalled()
    })

    it('serves the theme passed with --theme', async () => {
        const themeFile = path.join(FIXTURES, '..', 'theme.json')
        server = await run(['-p', FIXTURES, '--no-preview', '--theme', themeFile], { appDir: FIXTURES, port: 0 })

        const { port } = server.address() as { port: number }
        const theme = await (await fetch(`http://localhost:${port}/theme.json`)).json()

        expect(theme).toEqual({ dark: { primary: '255 0 0' } })
    })

    it('fails before parsing when the theme is invalid', async () => {
        await expect(
            run(['-p', FIXTURES, '--no-preview', '-t', path.join(FIXTURES, 'Full.vue')], { appDir: FIXTURES, port: 0 }),
        ).rejects.toThrow(SyntaxError)
        expect(logs()).not.toContain('We are analyzing')
    })

    it('opens the browser with -o', async () => {
        server = await run(['-p', FIXTURES, '--no-preview', '-o'], { appDir: FIXTURES, port: 0 })

        const { port } = server.address() as { port: number }
        expect(open).toHaveBeenCalledWith(`http://localhost:${port}`)
    })
})
