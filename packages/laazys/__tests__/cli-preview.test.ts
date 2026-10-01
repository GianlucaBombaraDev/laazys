import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPreview } from '../utils/preview'
import { run } from '../utils/cli'

vi.mock('open', () => ({ default: vi.fn() }))
vi.mock('../utils/get-documentations', () => ({ getDocumentation: vi.fn(async () => []) }))
vi.mock('../utils/preview', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../utils/preview')>()),
    createPreview: vi.fn(),
}))

const logs = () => vi.mocked(console.log).mock.calls.flat().join('\n')

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
    vi.restoreAllMocks()
})

const close = (server: { close: (callback: () => void) => void }) =>
    new Promise<void>((resolve) => server.close(() => resolve()))

describe('run preview options', () => {
    it('passes the setup module and closes Vite with the server', async () => {
        const vite = { middlewares: vi.fn(), transformIndexHtml: vi.fn(), close: vi.fn() }
        vi.mocked(createPreview).mockResolvedValue({ enabled: true, server: vite })

        const server = await run(['-p', 'src', '--preview-setup', 'preview.setup.ts'], { appDir: '.', port: 0 })
        await close(server)

        expect(createPreview).toHaveBeenCalledWith('src', 'preview.setup.ts')
        expect(vite.close).toHaveBeenCalled()
        expect(logs()).not.toContain('Component preview off')
    })

    it('explains why the preview is off', async () => {
        vi.mocked(createPreview).mockResolvedValue({ enabled: false, reason: 'Vite is not installed in the project' })

        await close(await run(['-p', 'src'], { appDir: '.', port: 0 }))

        expect(logs()).toContain('Component preview off: Vite is not installed in the project')
    })

    it('skips Vite with --no-preview', async () => {
        await close(await run(['-p', 'src', '--no-preview'], { appDir: '.', port: 0 }))

        expect(createPreview).not.toHaveBeenCalled()
        expect(logs()).toContain('Component preview off: Disabled with --no-preview')
    })
})
