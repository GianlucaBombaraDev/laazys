import type { Server } from 'http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDocumentation } from '../utils/get-documentations'
import { watchFolder } from '../utils/watch'
import { run } from '../utils/cli'

vi.mock('open', () => ({ default: vi.fn() }))
vi.mock('../utils/get-documentations', () => ({ getDocumentation: vi.fn() }))
vi.mock('../utils/watch', () => ({ watchFolder: vi.fn() }))

const stopWatching = vi.fn()
let onChange: () => Promise<void>
let server: Server

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.mocked(getDocumentation).mockResolvedValue([{ id: 'a' }])
    vi.mocked(watchFolder).mockImplementation((dir, callback) => {
        onChange = callback as () => Promise<void>
        return stopWatching
    })
})

afterEach(async () => {
    vi.restoreAllMocks()
    await new Promise((resolve) => (server.listening ? server.close(resolve) : resolve(undefined)))
})

const filesOf = async (server: Server) => {
    const { port } = server.address() as { port: number }
    return (await fetch(`http://localhost:${port}/files`)).json()
}

describe('run --watch', () => {
    it('does not watch without the flag', async () => {
        server = await run(['-p', 'src', '--no-preview'], { appDir: '.', port: 0 })

        expect(watchFolder).not.toHaveBeenCalled()
    })

    it('watches the resolved folder and serves the regenerated docs', async () => {
        server = await run(['-p', 'src', '--no-preview', '--watch'], { appDir: '.', port: 0 })

        expect(watchFolder).toHaveBeenCalledWith(`${process.cwd()}/src`, expect.any(Function))
        expect(await filesOf(server)).toEqual([{ id: 'a' }])

        vi.mocked(getDocumentation).mockResolvedValue([{ id: 'a' }, { id: 'b' }])
        await onChange()

        expect(await filesOf(server)).toHaveLength(2)
        expect(vi.mocked(console.log).mock.calls.flat().join('\n')).toContain('Docs updated')
    })

    it('keeps the last docs when regenerating fails', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        server = await run(['-p', 'src', '--no-preview', '-w'], { appDir: '.', port: 0 })
        const error = new Error('folder removed')
        vi.mocked(getDocumentation).mockRejectedValue(error)

        await onChange()

        expect(consoleError).toHaveBeenCalledWith(error)
        expect(await filesOf(server)).toEqual([{ id: 'a' }])
    })

    it('stops watching when the server closes', async () => {
        server = await run(['-p', 'src', '--no-preview', '-w'], { appDir: '.', port: 0 })

        await new Promise((resolve) => server.close(resolve))

        expect(stopWatching).toHaveBeenCalled()
    })
})
